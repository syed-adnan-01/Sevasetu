import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Camera, CheckCircle2, FileText, Upload } from "lucide-react";

export function TaskCompletion() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Fetch specific task. In a real app we'd have a GET /api/tasks/:id endpoint.
    // For demo, we'll fetch all and find it.
    const fetchTask = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks');
        const data = await res.json();
        const found = data.find((t: any) => t._id === taskId);
        setTask(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionNotes: notes,
          completionProof: imagePreview
        })
      });
      setIsDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center bg-gray-800/50 p-10 rounded-3xl border border-gray-700/50 max-w-md w-full">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Task Completed!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for your service. Your proof has been submitted to the NGO administrators for verification.
          </p>
          <button 
            onClick={() => navigate('/volunteers')}
            className="px-6 py-3 bg-[#4DA3FF] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
          >
            Find More Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div className="p-8 text-center text-gray-400">Loading task details...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <CheckCircle2 className="text-[#4CAF50]" size={32} />
          Complete Task
        </h2>
        <p className="text-gray-400">Provide proof of work to resolve this issue on the map.</p>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-2">{task.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{task.description}</p>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-semibold uppercase tracking-wider border border-yellow-500/20">
            {task.status}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <FileText size={16} /> Completion Notes
          </label>
          <textarea
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what actions were taken..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-[#4DA3FF] focus:outline-none transition-all resize-none h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Camera size={16} /> Proof of Completion (Optional Image)
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${
              imagePreview ? "border-[#4DA3FF] bg-[#4DA3FF]/5" : "border-gray-700 bg-gray-900/50 group-hover:border-gray-500 group-hover:bg-gray-800/50"
            }`}>
              {imagePreview ? (
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-gray-700">
                  <img src={imagePreview} alt="Proof preview" className="w-full h-auto" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Upload size={18} /> Tap to change
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-500 mb-3" />
                  <span className="text-sm font-medium text-gray-300">Tap to take a photo or upload</span>
                  <span className="text-xs text-gray-500 mt-1">Helps Admins verify the work quickly</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !notes}
          className="w-full py-4 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-[#4DA3FF]/20 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? "Submitting Proof..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
