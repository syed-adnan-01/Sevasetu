import { useState, useEffect, useRef } from "react";
import { Camera, Mic, Send, Sparkles, X, Loader2, Save, MapPin, Navigation } from "lucide-react";
import Tesseract from "tesseract.js";
import EXIF from "exif-js";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function LocationPicker({ reverseGeocode }: { reverseGeocode: any }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      reverseGeocode(lat, lng, "map click");
    },
  });
  return null;
}

export function ReportUpload() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [offlineReports, setOfflineReports] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription(prev => prev + " " + transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Load offline reports
    const saved = localStorage.getItem("offline_reports");
    if (saved) setOfflineReports(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2 && showSuggestions) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Search failed", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSuggestions]);

  const reverseGeocode = async (lat: number, lng: number, source: string) => {
    try {
      setStatus(`Resolving address for ${source}...`);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.display_name.split(',').slice(0, 4).join(',');
      setLocation({ lat, lng, address });
      setSearchQuery(address);
      setShowSuggestions(false);
      setStatus(`Location verified: ${address}`);
    } catch (err) {
      setLocation({ lat, lng, address: "Location Verified" });
      setSearchQuery("Location Verified");
      setShowSuggestions(false);
      setStatus(`Location pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setLocation({ lat, lng, address: suggestion.display_name });
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Extract Geotag from Photo (EXIF)
      EXIF.getData(file as any, function(this: any) {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const lng = EXIF.getTag(this, "GPSLongitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
        const lngRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

        if (lat && lng) {
          const latitude = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === "N" ? 1 : -1);
          const longitude = (lng[0] + lng[1] / 60 + lng[2] / 3600) * (lngRef === "E" ? 1 : -1);
          reverseGeocode(latitude, longitude, "photo geotag");
        }
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setStatus("Fetching GPS coordinates...");
    
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude, "current GPS");
        setIsGettingLocation(false);
      },
      (error) => {
        console.error(error);
        setStatus("Could not get location. Please enable GPS.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const processImage = async (imageSrc: string) => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setStatus("Analyzing image with Gemini AI...");
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc })
      });
      
      const data = await response.json();
      
      if (data.description) {
        setDescription(data.description);
        setStatus("Success: Incident analyzed!");
      } else {
        setStatus("AI Fallback: Trying OCR...");
        const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng+hin');
        if (text.trim()) {
          setDescription(text.trim());
          setStatus("Success: Text detected!");
        } else {
          setStatus("AI finished: No clear data found.");
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("AI analysis error");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    
    if (!description.trim() && !preview) {
      setFormError("You must provide either a description or an image.");
      return;
    }
    
    if (!location || location.lat === 0 || location.lng === 0) {
      setFormError("Location is compulsory. Please select a verified location from the suggestions, pin it on the map, or use the GPS button.");
      return;
    }

    const report = {
      description,
      image: preview,
      timestamp: new Date().toISOString(),
      status: "pending",
      location: location,
      userEmail: user?.email
    };

    if (!navigator.onLine) {
      const updated = [...offlineReports, report];
      setOfflineReports(updated);
      localStorage.setItem("offline_reports", JSON.stringify(updated));
      setStatus("Saved locally (Offline)");
      return;
    }

    setIsProcessing(true);
    setStatus("Submitting to database...");
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        setStatus("Report submitted successfully!");
        setPreview(null);
        setDescription("");
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit. Saved locally.");
      const updated = [...offlineReports, report];
      setOfflineReports(updated);
      localStorage.setItem("offline_reports", JSON.stringify(updated));
    } finally {
      setIsProcessing(false);
    }
  };

  const syncOffline = async () => {
    if (navigator.onLine && offlineReports.length > 0) {
      setStatus(`Syncing ${offlineReports.length} reports...`);
      setIsProcessing(true);
      
      try {
        for (const report of offlineReports) {
          await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
        }
        setOfflineReports([]);
        localStorage.removeItem("offline_reports");
        setStatus("All reports synced!");
      } catch (err) {
        console.error(err);
        setStatus("Sync failed. Will retry later.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {offlineReports.length > 0 && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <Save size={20} />
              <span className="text-sm font-medium">{offlineReports.length} reports waiting to sync</span>
            </div>
            <button 
              onClick={syncOffline}
              className="text-xs px-3 py-1 bg-amber-500 text-black rounded-lg font-bold hover:bg-amber-400 transition-colors"
            >
              Sync Now
            </button>
          </div>
        )}

        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl hover:shadow-[#4DA3FF]/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
              Report an Issue
            </h2>
            {status && (
              <span className="text-xs text-gray-400 animate-pulse">{status}</span>
            )}
          </div>

          <div className="space-y-6">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className={`w-full h-48 lg:h-64 object-contain bg-black/20 rounded-xl border border-gray-700 ${isProcessing ? 'opacity-50' : ''}`}
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#4DA3FF]" size={40} />
                  </div>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 p-2 bg-[#FF4D4D] rounded-lg hover:bg-[#FF4D4D]/80 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 lg:p-12 text-center cursor-pointer hover:border-[#4DA3FF] hover:bg-gray-800/30 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#4DA3FF]/10">
                  <Camera size={40} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 text-sm lg:text-base">Click to upload a photo</p>
                  <p className="text-xs text-gray-500 mt-2">or drag and drop</p>
                </div>
              </label>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or use voice/photo to auto-fill..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-[#4DA3FF] focus:ring-2 focus:ring-[#4DA3FF]/20 transition-all text-white placeholder-gray-500 text-sm lg:text-base"
              ></textarea>
            </div>

            <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={18} className="text-[#4DA3FF]" />
                  <span className="text-sm font-medium">Issue Location</span>
                </div>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#4DA3FF]/10 text-[#4DA3FF] border border-[#4DA3FF]/30 rounded-lg hover:bg-[#4DA3FF]/20 transition-all"
                >
                  {isGettingLocation ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                  Pin Current Location
                </button>
              </div>
              
              <div className="flex flex-col gap-2 mb-3 relative">
                <input
                  type="text"
                  value={showSuggestions ? searchQuery : (location?.address || searchQuery || (location && location.lat !== 0 ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ""))}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setLocation(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Type your location manually or click on the map below..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF]/20 transition-all text-white placeholder-gray-500 text-sm"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-[52px] left-0 right-0 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-[1000] shadow-xl">
                    {suggestions.map((s, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleSelectSuggestion(s)}
                        className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0 text-sm text-gray-200 transition-colors"
                      >
                        {s.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-64 rounded-xl overflow-hidden relative z-0 border border-gray-700/50">
                <MapContainer 
                  center={location ? [location.lat, location.lng] : [28.6139, 77.2090]}
                  zoom={location ? 15 : 11} 
                  style={{ height: '100%', width: '100%', background: '#0B0F14' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  />
                  {location && location.lat !== 0 && <ChangeView center={[location.lat, location.lng]} />}
                  <LocationPicker reverseGeocode={reverseGeocode} />
                  {location && (
                    <CircleMarker 
                      center={[location.lat, location.lng]} 
                      radius={8}
                      pathOptions={{ fillColor: '#4DA3FF', color: '#4DA3FF', fillOpacity: 0.8 }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>

            {formError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">
                {formError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={toggleRecording}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 lg:py-4 rounded-xl font-medium transition-all duration-200 ${
                  isRecording
                    ? "bg-[#FF4D4D] hover:bg-[#FF4D4D]/80 shadow-lg shadow-[#FF4D4D]/30"
                    : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                } text-sm lg:text-base`}
              >
                <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
                {isRecording ? "Listening..." : "Record Voice"}
              </button>

              <button 
                onClick={() => processImage(preview || "")}
                disabled={!preview || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/30 text-sm lg:text-base"
              >
                <Sparkles size={20} />
                Auto-detect
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 disabled:opacity-50 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-[#4DA3FF]/30"
            >
              <Send size={20} />
              Submit Report
            </button>
          </div>
        </div>

        <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 hover:border-[#4DA3FF]/50 hover:bg-gray-800/40 transition-all duration-300">
          <h3 className="font-semibold mb-3 text-[#4DA3FF]">Intelligent Collection</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Photo OCR detects text in <b>English & Hindi</b></li>
            <li>• <b>Auto-Geotag:</b> Pulls location from photo metadata</li>
            <li>• <b>GPS Pinning:</b> Accurate to within a few meters</li>
            <li>• Reports are saved <b>locally</b> if you lose internet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
