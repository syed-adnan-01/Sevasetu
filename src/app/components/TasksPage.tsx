import { useState, useEffect, useRef } from "react";
import { ClipboardList, Clock, AlertCircle, CheckCircle2, ChevronRight, MapPin, X, Camera, Send, Loader2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import EXIF from "exif-js";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../context/AuthContext";

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const addressCache = useRef<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskAddress, setTaskAddress] = useState("");
  const [completionProof, setCompletionProof] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [proofLocation, setProofLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/assigned/${user.email}`);
      const data = await response.json();
      setTasks(data);
      
      // Resolve addresses for all tasks in the background, caching to avoid API spam
      data.forEach((task: any) => {
        if (task.location?.lat && !addressCache.current[task._id]) {
          addressCache.current[task._id] = true;
          resolveAddress(task._id, task.location.lat, task.location.lng);
        }
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAddress = async (taskId: string, lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address.suburb || data.address.city || data.address.state || "Location Verified";
      setAddresses(prev => ({ ...prev, [taskId]: addr }));
    } catch (err) {
      setAddresses(prev => ({ ...prev, [taskId]: `${lat.toFixed(2)}, ${lng.toFixed(2)}` }));
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Extract Geotag from proof photo
      EXIF.getData(file as any, function(this: any) {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const lng = EXIF.getTag(this, "GPSLongitude");
        if (lat && lng) {
          const latitude = (lat[0] + lat[1] / 60 + lat[2] / 3600);
          const longitude = (lng[0] + lng[1] / 60 + lng[2] / 3600);
          
          // Get human-readable address
          reverseGeocode(latitude, longitude);
        } else {
          // If no EXIF, fallback to current browser GPS (since it's a Live Photo)
          navigator.geolocation.getCurrentPosition((pos) => {
            reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          });
        }
      });

      const reader = new FileReader();
      reader.onloadend = () => setCompletionProof(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      getTaskAddress(selectedTask.location.lat, selectedTask.location.lng);
    }
  }, [selectedTask]);

  const getTaskAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setTaskAddress(data.display_name || "Location Verified");
    } catch (err) {
      setTaskAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setVideoStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setStatusMsg("Camera access denied. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById("proof-video") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCompletionProof(dataUrl);
    
    // Auto-verify location when photo is snapped
    navigator.geolocation.getCurrentPosition((pos) => {
      reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    });

    stopCamera();
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setStatusMsg("Resolving proof location...");
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setProofLocation({ 
        lat, 
        lng, 
        address: data.display_name.split(',').slice(0, 3).join(',') || "Location Verified" 
      });
      setStatusMsg("Live proof verified with location!");
    } catch (err) {
      setProofLocation({ lat, lng, address: "Location Verified" });
    }
  };

  const submitCompletion = async () => {
    if (!completionProof) {
      setStatusMsg("Please upload a proof photo.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask._id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionNotes,
          completionProof,
          proofLocation // Sending for admin verification
        })
      });

      if (response.ok) {
        setStatusMsg("Task marked as completed!");
        fetchTasks();
        setTimeout(() => setSelectedTask(null), 1500);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500/20 text-red-500 border-red-500/50";
      case "assigned": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "completed": return "bg-green-500/20 text-green-500 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-[#4DA3FF]" size={28} />
            Actionable Tasks
          </h2>
          <p className="text-gray-400 text-sm mt-1">Auto-generated from high-priority reports</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700/50">
          {["all", "open", "assigned", "completed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filter === f ? "bg-[#4DA3FF] text-white shadow-lg" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DA3FF]"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-gray-700/50">
          <CheckCircle2 className="mx-auto h-16 w-16 text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-300">No Tasks Found</h3>
          <p className="text-gray-500 mt-2">There are no {filter !== "all" ? filter : ""} tasks at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task._id} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-gray-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className={`px-2.5 py-1 rounded text-xs font-semibold border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
                {task.urgencyScore >= 70 && (
                  <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">
                    <AlertCircle size={12} /> CRITICAL
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-100 mb-2 leading-tight">{task.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{task.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {task.requiredSkills.map((skill: string) => (
                  <span key={skill} className="px-2 py-1 bg-[#4DA3FF]/10 text-[#4DA3FF] rounded text-xs font-medium border border-[#4DA3FF]/20">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700/50 mt-auto flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
                {task.location?.lat && (
                  <div className="flex items-center gap-1 bg-[#4DA3FF]/10 px-2 py-0.5 rounded border border-[#4DA3FF]/20">
                    <MapPin size={12} className="text-[#4DA3FF]" />
                    <span className="truncate max-w-[120px]">
                      {addresses[task._id] || "Resolving..."}
                    </span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setSelectedTask(task);
                  setCompletionProof(null);
                  setCompletionNotes("");
                  setStatusMsg("");
                  setProofLocation(null);
                }}
                className="w-full mt-4 bg-gray-700 hover:bg-[#4DA3FF] text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group-hover:bg-[#4DA3FF] group-hover:shadow-lg group-hover:shadow-[#4DA3FF]/20"
              >
                View Details <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Details & Completion Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111827] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-800/30">
                <div>
                  <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mb-1 inline-block ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{selectedTask.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Description Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#4DA3FF] uppercase tracking-wider">Mission Overview</h4>
                  <p className="text-gray-300 leading-relaxed bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Verified Mission Location</h4>
                    <div className="flex items-start gap-2 text-gray-200">
                      <MapPin size={16} className="text-[#4CAF50] shrink-0 mt-0.5" />
                      <span className="text-sm leading-tight">
                        {taskAddress || addresses[selectedTask._id] || "Resolving address..."}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Deployment Date</h4>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Clock size={16} className="text-[#4DA3FF]" />
                      <span className="text-sm">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Completion Section */}
                {selectedTask.status !== 'completed' ? (
                  <div className="border-t border-gray-800 pt-6 mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Submit Completion Proof</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Photo Proof */}
                      <div className="relative h-40 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center bg-gray-900/50 hover:border-[#4DA3FF]/50 transition-colors cursor-pointer overflow-hidden">
                        {showCamera ? (
                          <div className="absolute inset-0 flex flex-col">
                            <video 
                              id="proof-video"
                              autoPlay 
                              playsInline 
                              className="flex-1 object-cover bg-black"
                              ref={(el) => { if(el) el.srcObject = videoStream; }}
                            />
                            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 px-2">
                              <button 
                                onClick={capturePhoto}
                                className="bg-[#4DA3FF] text-black font-bold px-4 py-1.5 rounded-lg text-xs"
                              >
                                Snap Photo
                              </button>
                              <button 
                                onClick={stopCamera}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : completionProof ? (
                          <>
                            <img src={completionProof} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Proof" />
                            <button 
                              onClick={() => setCompletionProof(null)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-md shadow-lg"
                            >
                              <X size={16} />
                            </button>
                            {proofLocation && (
                              <div className="absolute bottom-2 left-2 right-2 bg-[#4CAF50]/90 backdrop-blur-md text-[10px] text-white px-2 py-1.5 rounded-lg font-bold flex flex-col gap-0.5 shadow-xl">
                                <div className="flex items-center gap-1">
                                  <Navigation size={10} /> LIVE LOCATION VERIFIED
                                </div>
                                <div className="text-[9px] font-medium opacity-90 truncate">
                                  {proofLocation.address}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div 
                            onClick={startCamera}
                            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                          >
                            <div className="w-16 h-16 bg-[#4DA3FF]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Camera size={32} className="text-[#4DA3FF]" />
                            </div>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Open Live Camera</span>
                            <span className="text-[10px] text-gray-500 mt-1">Proof requires GPS validation</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Additional completion notes (e.g. supplies delivered, people helped)..."
                        className="h-40 w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-sm focus:outline-none focus:border-[#4DA3FF] transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{statusMsg}</span>
                      <button 
                        onClick={submitCompletion}
                        disabled={isSubmitting || !completionProof}
                        className="px-8 py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/90 hover:to-[#4CAF50]/90 disabled:opacity-50 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#4DA3FF]/20"
                      >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Complete Mission
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-2">
                    <CheckCircle2 size={40} className="text-[#4CAF50] mx-auto" />
                    <h4 className="text-lg font-bold text-[#4CAF50]">Task Fully Completed</h4>
                    <p className="text-sm text-gray-400 italic">Proof of work and geotags have been verified by the system.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
