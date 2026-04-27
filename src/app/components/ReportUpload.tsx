import { useState } from "react";
import { Camera, Mic, Send, Sparkles, X } from "lucide-react";

export function ReportUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log("Report submitted");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:shadow-[#4DA3FF]/10 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
            Report an Issue
          </h2>

          <div className="space-y-6">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border border-gray-700"
                />
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
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-[#4DA3FF] hover:bg-gray-800/30 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#4DA3FF]/10">
                  <Camera size={48} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">Click to upload a photo</p>
                  <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                </div>
              </label>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-[#4DA3FF] focus:ring-2 focus:ring-[#4DA3FF]/20 transition-all text-white placeholder-gray-500"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                  isRecording
                    ? "bg-[#FF4D4D] hover:bg-[#FF4D4D]/80 shadow-lg shadow-[#FF4D4D]/30"
                    : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                <Mic size={20} />
                {isRecording ? "Recording..." : "Record Voice"}
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/30">
                <Sparkles size={20} />
                Auto-detect Problem
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-[#4DA3FF]/30"
            >
              <Send size={20} />
              Submit Report
            </button>
          </div>
        </div>

        <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 hover:border-[#4DA3FF]/50 hover:bg-gray-800/40 transition-all duration-300">
          <h3 className="font-semibold mb-3 text-[#4DA3FF]">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Take clear photos showing the problem</li>
            <li>• Include landmarks for easier location</li>
            <li>• Voice recordings help provide context</li>
            <li>• Auto-detect uses AI to categorize issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
