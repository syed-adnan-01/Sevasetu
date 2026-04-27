import { useState, useEffect } from "react";
import { Plus, Bell, TrendingUp, Users, CheckCircle, AlertCircle, Clock, MapPin, Loader2, FileText, RefreshCw } from "lucide-react";

export function AdminPanel() {
  const [reports, setReports] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, tasksRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports'),
        fetch('http://localhost:5000/api/tasks')
      ]);
      setReports(await reportsRes.json());
      setTasks(await tasksRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/verify`, { method: "PUT" });
      fetchData(); // Refresh to update map/report status
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const volunteerAvailability = [
    { zone: "North Area", available: 45, active: 32 },
    { zone: "East District", available: 38, active: 28 },
    { zone: "South Zone", available: 52, active: 41 },
    { zone: "West Side", available: 29, active: 18 },
  ];

  const pendingVerification = tasks.filter(t => t.status === 'completed' && !t.verifiedByAdmin);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-[#FF4D4D]/20 border-[#FF4D4D] text-[#FF4D4D]";
      case "high":
        return "bg-[#FFC857]/20 border-[#FFC857] text-[#FFC857]";
      default:
        return "bg-[#4DA3FF]/20 border-[#4DA3FF] text-[#4DA3FF]";
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4DA3FF]/20 hover:scale-105 hover:border-[#4DA3FF]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Total Reports</div>
              <FileText className="text-[#4DA3FF]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">{reports.length}</div>
            <div className="text-xs text-[#4CAF50] flex items-center gap-1">
              <TrendingUp size={12} />
              Real-time
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Active Volunteers</div>
              <Users className="text-[#4CAF50]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">119</div>
            <div className="text-xs text-gray-400">In the field</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Pending Tasks</div>
              <CheckCircle className="text-[#4CAF50]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">47</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#FF4D4D]/20 hover:scale-105 hover:border-[#FF4D4D]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Critical Issues</div>
              <AlertCircle className="text-[#FF4D4D]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {reports.filter(r => r.urgencyScore > 70).length || 2}
            </div>
            <div className="text-xs text-[#FF4D4D]">Need attention</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="text-[#FF4D4D]" size={20} />
                  Real-time Reports
                </h3>
                <button 
                  onClick={fetchReports}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Loading database reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                  <p className="text-gray-500">No reports found in the database.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div
                      key={report._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70 hover:scale-[1.02] transition-all duration-300 cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {report.image && (
                          <img src={report.image} className="w-12 h-12 rounded-lg object-cover border border-gray-700" alt="Report" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{report.description || "No description"}</div>
                          <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                            <Clock size={14} />
                            {new Date(report.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg border text-[10px] sm:text-xs font-medium ${getSeverityColor(report.urgencyScore > 70 ? 'critical' : 'moderate')} whitespace-nowrap`}>
                        {report.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="text-[#4CAF50]" size={20} />
                Volunteer Availability by Zone
              </h3>
              <div className="space-y-4">
                {volunteerAvailability.map((zone, index) => {
                  const percentage = (zone.active / zone.available) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="font-medium truncate">{zone.zone}</div>
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          {zone.active} / {zone.available} active
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300 h-fit">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="text-[#4CAF50]" size={20} />
              Pending Verification
            </h3>
            
            {pendingVerification.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                No tasks awaiting verification.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerification.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 flex flex-col gap-3 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-xs text-gray-400 mt-1">Submitted recently</div>
                      </div>
                      <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Review
                      </span>
                    </div>
                    
                    {task.completionNotes && (
                      <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 border border-gray-700">
                        "{task.completionNotes}"
                      </div>
                    )}
                    
                    {task.completionProof && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
                        <img src={task.completionProof} alt="Proof" className="w-full h-auto object-cover max-h-40" />
                      </div>
                    )}

                    <button 
                      onClick={() => handleVerifyTask(task._id)}
                      className="w-full mt-2 py-2 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white border border-[#4CAF50]/30 font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={18} /> Verify & Close Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
