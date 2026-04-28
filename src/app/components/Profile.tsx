import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { MapPin, Save, Loader2, Navigation } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function Profile() {
  const { user, updateUser } = useAuth();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      setLocation({ lat: user.location.lat, lng: user.location.lng });
      resolveAddress(user.location.lat, user.location.lng);
    }
  }, [user]);

  const resolveAddress = async (lat: number, lng: number) => {
    try {
      setAddress("Resolving address...");
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setAddress(data.display_name || "Custom Location");
    } catch (err) {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        resolveAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          resolveAddress(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setSaveMessage({ text: "Could not access location.", type: "error" });
        }
      );
    }
  };

  const saveProfile = async () => {
    if (!user || !location) return;
    setIsSaving(true);
    setSaveMessage({ text: "", type: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          location: location
        })
      });
      if (response.ok) {
        setSaveMessage({ text: "Profile updated successfully!", type: "success" });
        updateUser({ location: location });
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-[#4DA3FF]" size={28} />
          Your Area of Work
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Set your primary location. Tasks closer to your area will be prioritized in your recommendations.
        </p>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase">Name</label>
            <div className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200">
              {user.name}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase">Email</label>
            <div className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed">
              {user.email}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-gray-400 uppercase">Operating Location</label>
              <div className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 min-h-[46px] flex items-center">
                {location ? address : "No location set"}
              </div>
            </div>
            <button
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Navigation size={18} className="text-[#4DA3FF]" />
              Detect My Location
            </button>
          </div>

          <div className="h-80 rounded-xl overflow-hidden relative z-0 border border-gray-700/50">
            <MapContainer 
              center={location ? [location.lat, location.lng] : [28.6139, 77.2090]}
              zoom={location ? 14 : 10} 
              style={{ height: '100%', width: '100%', background: '#0B0F14' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {location && <ChangeView center={[location.lat, location.lng]} />}
              <MapEvents />
              {location && (
                <CircleMarker 
                  center={[location.lat, location.lng]} 
                  radius={8}
                  pathOptions={{ fillColor: '#4DA3FF', color: '#4DA3FF', fillOpacity: 0.8 }}
                />
              )}
            </MapContainer>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white pointer-events-none">
              Click anywhere on the map to set location
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-700/50">
          <div className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {saveMessage.text}
          </div>
          <button 
            onClick={saveProfile}
            disabled={isSaving || !location}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/90 hover:to-[#4CAF50]/90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#4DA3FF]/20"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
