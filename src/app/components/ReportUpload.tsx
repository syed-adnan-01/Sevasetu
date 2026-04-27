import { useState, useEffect, useRef } from "react";
import { Camera, Mic, Send, Sparkles, X, Loader2, Save } from "lucide-react";
import Tesseract from "tesseract.js";

export function ReportUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [offlineReports, setOfflineReports] = useState<any[]>([]);
  
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageSrc: string) => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setStatus("Enhancing image for AI...");
    
    try {
      // Create an image object to get dimensions and draw on canvas
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Set canvas to original image size for full resolution processing
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Preprocessing: Convert to Grayscale and increase Contrast for Tesseract
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale conversion
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Simple contrast enhancement
        const contrast = 1.2; // Increase contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const newValue = factor * (avg - 128) + 128;
        
        data[i] = newValue;     // Red
        data[i + 1] = newValue; // Green
        data[i + 2] = newValue; // Blue
      }
      ctx.putImageData(imageData, 0, 0);

      // Use a higher quality JPEG for OCR processing
      const processedImage = canvas.toDataURL('image/jpeg', 0.95);
      
      setStatus("Analyzing text (Hindi + English)...");
      const { data: { text } } = await Tesseract.recognize(processedImage, 'eng+hin', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setStatus(`AI Reading: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      if (text.trim()) {
        const cleanedText = text.trim().replace(/\n+/g, ' ');
        setDescription(prev => prev + (prev ? "\n\n" : "") + "[AI Detection]: " + cleanedText);
        setStatus("Success: Text detected!");
      } else {
        setStatus("AI finished: No text found.");
      }
    } catch (err) {
      console.error(err);
      setStatus("AI detection error");
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
    const report = {
      description,
      image: preview,
      timestamp: new Date().toISOString(),
      status: "pending",
      location: { lat: 0, lng: 0 } // Placeholder for future GPS
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
      const response = await fetch('http://localhost:5000/api/reports', {
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
      // Save locally as fallback
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
          await fetch('http://localhost:5000/api/reports', {
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
            <li>• Voice transcription works in real-time</li>
            <li>• Reports are saved <b>locally</b> if you lose internet</li>
            <li>• Auto-detect analyzes patterns and keywords</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
