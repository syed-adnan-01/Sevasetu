import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Camera, CheckCircle, X, ArrowLeft } from "lucide-react";

export function TaskCompletion() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setTimeout(() => {
      navigate("/tasks");
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-6 inline-block p-6 bg-gradient-to-br from-[#4CAF50]/20 to-[#4DA3FF]/20 rounded-full border border-[#4CAF50]/30 shadow-2xl shadow-[#4CAF50]/20 animate-pulse">
            <CheckCircle size={80} className="text-[#4CAF50]" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#4CAF50] to-[#4DA3FF] bg-clip-text text-transparent">
            Task Completed!
          </h2>
          <p className="text-gray-400 mb-2">Thank you for your contribution</p>
          <p className="text-sm text-gray-500">Redirecting to tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/tasks")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>

        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:shadow-[#4DA3FF]/10 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Complete Task #{taskId}</h2>
          <p className="text-gray-400 mb-6">Upload proof of completion and add any notes</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Proof of Completion</label>
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Proof"
                    className="w-full h-64 object-cover rounded-xl border border-gray-700"
                  />
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute top-3 right-3 p-2 bg-[#FF4D4D] hover:bg-[#FF4D4D]/80 rounded-lg transition-colors shadow-lg"
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
                    <p className="text-gray-400">Upload proof image</p>
                    <p className="text-sm text-gray-500 mt-2">Click or drag to upload</p>
                  </div>
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Completion Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any important details about task completion..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-[#4DA3FF] focus:ring-2 focus:ring-[#4DA3FF]/20 transition-all text-white placeholder-gray-500"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/tasks")}
                className="flex-1 px-6 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!preview}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                  preview
                    ? "bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 shadow-lg shadow-[#4DA3FF]/30"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={20} />
                Submit Completion
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 hover:border-[#4CAF50]/50 hover:bg-gray-800/40 transition-all duration-300">
          <h3 className="font-semibold mb-3 text-[#4CAF50]">Completion Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Upload a clear photo showing completed work</li>
            <li>• Include before/after shots if applicable</li>
            <li>• Note any challenges or additional needs</li>
            <li>• Mention materials used or resources needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
