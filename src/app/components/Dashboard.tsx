import { AlertCircle, Users, CheckCircle, MapPin } from "lucide-react";

export function Dashboard() {
  const urgentIssues = [
    { id: 1, title: "Water contamination in Zone A", severity: "critical", location: "Downtown", volunteers: 3 },
    { id: 2, title: "Food shortage reported", severity: "high", location: "East District", volunteers: 5 },
    { id: 3, title: "Medical supplies needed", severity: "critical", location: "North Area", volunteers: 2 },
    { id: 4, title: "Debris blocking main road", severity: "moderate", location: "West Side", volunteers: 4 },
    { id: 5, title: "Power outage assistance", severity: "moderate", location: "South Zone", volunteers: 6 },
  ];

  const heatmapZones = [
    { id: 1, x: 25, y: 30, intensity: "critical", size: 120 },
    { id: 2, x: 60, y: 45, intensity: "moderate", size: 90 },
    { id: 3, x: 40, y: 70, intensity: "high", size: 100 },
    { id: 4, x: 75, y: 25, intensity: "stable", size: 80 },
    { id: 5, x: 15, y: 60, intensity: "high", size: 95 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-[#FF4D4D]/20 border-[#FF4D4D] text-[#FF4D4D]";
      case "high":
        return "bg-[#FFC857]/20 border-[#FFC857] text-[#FFC857]";
      case "moderate":
        return "bg-[#4DA3FF]/20 border-[#4DA3FF] text-[#4DA3FF]";
      default:
        return "bg-[#4CAF50]/20 border-[#4CAF50] text-[#4CAF50]";
    }
  };

  const getHeatmapColor = (intensity: string) => {
    switch (intensity) {
      case "critical":
        return "bg-[#FF4D4D]";
      case "high":
        return "bg-[#FFC857]";
      case "moderate":
        return "bg-[#4DA3FF]";
      default:
        return "bg-[#4CAF50]";
    }
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0B0F14] to-gray-900">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>

        {heatmapZones.map((zone) => (
          <div
            key={zone.id}
            className={`absolute rounded-full blur-2xl opacity-40 ${getHeatmapColor(zone.intensity)}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.size}px`,
              height: `${zone.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          ></div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <MapPin size={200} className="text-gray-600" />
        </div>
      </div>

      <div className="relative z-10 p-6 h-full overflow-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Active Volunteers</div>
              <Users className="text-[#4CAF50]" size={24} />
            </div>
            <div className="text-3xl font-bold">247</div>
            <div className="text-xs text-[#4CAF50] mt-1">+12% from yesterday</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4DA3FF]/20 hover:scale-105 hover:border-[#4DA3FF]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Tasks Completed</div>
              <CheckCircle className="text-[#4DA3FF]" size={24} />
            </div>
            <div className="text-3xl font-bold">89</div>
            <div className="text-xs text-[#4DA3FF] mt-1">Today</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#FF4D4D]/20 hover:scale-105 hover:border-[#FF4D4D]/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">Critical Issues</div>
              <AlertCircle className="text-[#FF4D4D]" size={24} />
            </div>
            <div className="text-3xl font-bold">12</div>
            <div className="text-xs text-[#FF4D4D] mt-1">Requires attention</div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-[#FF4D4D]" size={20} />
            Top 5 Urgent Issues
          </h3>
          <div className="space-y-3">
            {urgentIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-gray-800/70 cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {issue.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users size={16} />
                  {issue.volunteers} volunteers
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
