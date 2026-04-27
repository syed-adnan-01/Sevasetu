import { useState, useEffect } from "react";
import { ClipboardList, Clock, AlertCircle, CheckCircle2, ChevronRight, MapPin } from "lucide-react";

export function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
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
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {task.location.lat.toFixed(2)}, {task.location.lng.toFixed(2)}
                  </div>
                )}
              </div>
              
              <button className="w-full mt-4 bg-gray-700 hover:bg-[#4DA3FF] text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-[#4DA3FF]">
                View Details <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
