import { Plus, Bell, TrendingUp, Users, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function AdminPanel() {
  const urgentProblems = [
    { id: 1, title: "Water contamination", severity: "critical", reports: 12, time: "15 min ago" },
    { id: 2, title: "Food shortage", severity: "high", reports: 8, time: "32 min ago" },
    { id: 3, title: "Medical supplies low", severity: "critical", reports: 5, time: "1 hour ago" },
    { id: 4, title: "Road blockage", severity: "moderate", reports: 3, time: "2 hours ago" },
  ];

  const volunteerAvailability = [
    { zone: "North Area", available: 45, active: 32 },
    { zone: "East District", available: 38, active: 28 },
    { zone: "South Zone", available: 52, active: 41 },
    { zone: "West Side", available: 29, active: 18 },
  ];

  const recentActivity = [
    { action: "Task completed", detail: "Water distribution in Zone A", time: "5 min ago", type: "success" },
    { action: "New report", detail: "Power outage in East District", time: "12 min ago", type: "info" },
    { action: "Volunteers joined", detail: "3 volunteers joined medical task", time: "18 min ago", type: "success" },
    { action: "Critical alert", detail: "Contamination detected in water source", time: "25 min ago", type: "critical" },
  ];

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

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#4CAF50]/20 text-[#4CAF50]";
      case "critical":
        return "bg-[#FF4D4D]/20 text-[#FF4D4D]";
      default:
        return "bg-[#4DA3FF]/20 text-[#4DA3FF]";
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-400">Monitor and manage volunteer operations</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D4D] to-[#FFC857] hover:from-[#FF4D4D]/80 hover:to-[#FFC857]/80 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-[#FF4D4D]/20">
              <Bell size={20} />
              Send Alert
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-[#4DA3FF]/20">
              <Plus size={20} />
              Create Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4DA3FF]/20 hover:scale-105 hover:border-[#4DA3FF]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Total Volunteers</div>
              <Users className="text-[#4DA3FF]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">164</div>
            <div className="text-xs text-[#4CAF50] flex items-center gap-1">
              <TrendingUp size={12} />
              +8% this week
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Active Now</div>
              <Users className="text-[#4CAF50]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">119</div>
            <div className="text-xs text-gray-400">In the field</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Tasks Today</div>
              <CheckCircle className="text-[#4CAF50]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">47</div>
            <div className="text-xs text-gray-400">89 completed</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#FF4D4D]/20 hover:scale-105 hover:border-[#FF4D4D]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Critical Issues</div>
              <AlertCircle className="text-[#FF4D4D]" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-xs text-[#FF4D4D]">Need attention</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-[#FF4D4D]" size={20} />
                Top Urgent Problems
              </h3>
              <div className="space-y-3">
                {urgentProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${getSeverityColor(problem.severity)}`}>
                        {problem.severity.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-sm text-gray-400 mt-1">{problem.reports} reports • {problem.time}</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#4DA3FF] hover:bg-[#4DA3FF]/80 rounded-lg text-sm transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="text-[#4CAF50]" size={20} />
                Volunteer Availability by Zone
              </h3>
              <div className="space-y-4">
                {volunteerAvailability.map((zone, index) => {
                  const percentage = (zone.active / zone.available) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{zone.zone}</div>
                        <div className="text-sm text-gray-400">
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

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-[#4DA3FF]" size={20} />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getActivityColor(activity.type)}`}>
                    {activity.action}
                  </div>
                  <div className="text-sm mb-1">{activity.detail}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
