import { Link } from "react-router";
import { Clock, MapPin, Users, AlertCircle } from "lucide-react";

export function TaskList() {
  const tasks = [
    {
      id: 1,
      title: "Distribute food packages",
      description: "Help distribute emergency food supplies to affected families",
      timeRequired: "2-3 hours",
      distance: "1.2 km",
      urgency: "critical",
      volunteersNeeded: 5,
      volunteersJoined: 3,
      location: "Community Center, Downtown",
    },
    {
      id: 2,
      title: "Medical assistance setup",
      description: "Set up temporary medical station for basic healthcare",
      timeRequired: "4-5 hours",
      distance: "3.5 km",
      urgency: "high",
      volunteersNeeded: 8,
      volunteersJoined: 5,
      location: "East District Hospital",
    },
    {
      id: 3,
      title: "Clear debris from main road",
      description: "Remove fallen trees and debris blocking the main access road",
      timeRequired: "3-4 hours",
      distance: "2.8 km",
      urgency: "moderate",
      volunteersNeeded: 10,
      volunteersJoined: 8,
      location: "Main Street, West Side",
    },
    {
      id: 4,
      title: "Water quality testing",
      description: "Test water sources in affected areas for contamination",
      timeRequired: "1-2 hours",
      distance: "0.8 km",
      urgency: "critical",
      volunteersNeeded: 3,
      volunteersJoined: 1,
      location: "Zone A, North Area",
    },
    {
      id: 5,
      title: "Shelter preparation",
      description: "Help prepare emergency shelter spaces with bedding and supplies",
      timeRequired: "2-3 hours",
      distance: "4.2 km",
      urgency: "high",
      volunteersNeeded: 6,
      volunteersJoined: 4,
      location: "Sports Complex, South Zone",
    },
    {
      id: 6,
      title: "Supply inventory check",
      description: "Count and organize emergency supplies in warehouse",
      timeRequired: "1-2 hours",
      distance: "1.5 km",
      urgency: "moderate",
      volunteersNeeded: 4,
      volunteersJoined: 3,
      location: "Relief Warehouse, Central",
    },
  ];

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return {
          bg: "bg-[#FF4D4D]/10",
          border: "border-[#FF4D4D]",
          text: "text-[#FF4D4D]",
          glow: "shadow-[#FF4D4D]/20",
        };
      case "high":
        return {
          bg: "bg-[#FFC857]/10",
          border: "border-[#FFC857]",
          text: "text-[#FFC857]",
          glow: "shadow-[#FFC857]/20",
        };
      default:
        return {
          bg: "bg-[#4DA3FF]/10",
          border: "border-[#4DA3FF]",
          text: "text-[#4DA3FF]",
          glow: "shadow-[#4DA3FF]/20",
        };
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-2">Available Tasks</h2>
            <p className="text-sm lg:text-base text-gray-400">Find tasks that match your skills and availability</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 rounded-xl border border-gray-700 hover:border-[#4DA3FF] transition-colors text-sm">
              Filter
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 rounded-xl border border-gray-700 hover:border-[#4DA3FF] transition-colors text-sm">
              Sort
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const styles = getUrgencyStyles(task.urgency);
            const progress = (task.volunteersJoined / task.volunteersNeeded) * 100;

            return (
              <div
                key={task.id}
                className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 hover:border-[#4DA3FF]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#4DA3FF]/20 hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold mb-2 truncate">{task.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 line-clamp-2">{task.description}</p>
                  </div>
                  <div className={`px-2 lg:px-3 py-1 rounded-lg border ${styles.border} ${styles.bg} ${styles.text} text-[10px] lg:text-xs font-medium whitespace-nowrap`}>
                    {task.urgency.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                    <Clock size={16} className="flex-shrink-0" />
                    <span className="truncate">{task.timeRequired}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span className="truncate">{task.distance} away • {task.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                    <Users size={16} className="flex-shrink-0" />
                    <span className="truncate">
                      {task.volunteersJoined} / {task.volunteersNeeded} volunteers joined
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${styles.bg} ${styles.border} border transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  to={`/complete/${task.id}`}
                  className={`block w-full text-center px-6 py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 rounded-xl font-medium transition-all duration-200 shadow-lg ${styles.glow} text-sm lg:text-base`}
                >
                  Join Task
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
