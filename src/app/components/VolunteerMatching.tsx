import { Link } from "react-router";
import { Sparkles, Clock, MapPin, Users, TrendingUp, Award } from "lucide-react";

export function VolunteerMatching() {
  const recommendedTasks = [
    {
      id: 1,
      title: "Water quality testing",
      description: "Test water sources in affected areas for contamination",
      matchScore: 95,
      matchReasons: ["Matches your skills", "Only 0.8km away", "Critical priority"],
      timeRequired: "1-2 hours",
      distance: "0.8 km",
      volunteersJoined: 1,
      volunteersNeeded: 3,
      skills: ["Laboratory", "Analysis"],
    },
    {
      id: 2,
      title: "Medical assistance setup",
      description: "Set up temporary medical station for basic healthcare",
      matchScore: 88,
      matchReasons: ["Medical background", "Available now", "High impact"],
      timeRequired: "4-5 hours",
      distance: "3.5 km",
      volunteersJoined: 5,
      volunteersNeeded: 8,
      skills: ["Medical", "Organization"],
    },
    {
      id: 3,
      title: "Supply inventory check",
      description: "Count and organize emergency supplies in warehouse",
      matchScore: 82,
      matchReasons: ["Close proximity", "Previous similar task", "Low time commitment"],
      timeRequired: "1-2 hours",
      distance: "1.5 km",
      volunteersJoined: 3,
      volunteersNeeded: 4,
      skills: ["Organization", "Data Entry"],
    },
  ];

  const yourStats = [
    { label: "Tasks Completed", value: "47", icon: Award },
    { label: "Hours Contributed", value: "128", icon: Clock },
    { label: "Impact Score", value: "892", icon: TrendingUp },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {yourStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-[#4CAF50]/20 hover:scale-105 hover:border-[#4CAF50]/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                  <Icon className="text-[#4CAF50]" size={20} />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-4 border border-purple-500/30 mb-6 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-sm lg:text-base">Smart Recommendations</h3>
              <p className="text-xs lg:text-sm text-gray-300">
                We've found tasks that match your skills, location, and availability. High-impact opportunities are highlighted.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl lg:text-2xl font-bold mb-4">Recommended For You</h2>

        <div className="space-y-4">
          {recommendedTasks.map((task) => {
            const progress = (task.volunteersJoined / task.volunteersNeeded) * 100;

            return (
              <div
                key={task.id}
                className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 hover:border-[#4DA3FF] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#4DA3FF]/30 hover:scale-[1.01] hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row items-start gap-4 lg:gap-6">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-[#4DA3FF] to-[#4CAF50] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl lg:text-2xl font-bold">{task.matchScore}</div>
                        <div className="text-[10px] lg:text-xs opacity-80">Match</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg lg:text-xl font-semibold mb-2 truncate">{task.title}</h3>
                        <p className="text-sm lg:text-base text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.matchReasons.map((reason, index) => (
                        <div
                          key={index}
                          className="px-2 lg:px-3 py-1 bg-[#4CAF50]/10 border border-[#4CAF50] text-[#4CAF50] rounded-lg text-[10px] lg:text-xs font-medium"
                        >
                          ✓ {reason}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                        <Clock size={16} />
                        <span>{task.timeRequired}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                        <MapPin size={16} />
                        <span className="truncate">{task.distance} away</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                        <Users size={16} />
                        <span>
                          {task.volunteersJoined} / {task.volunteersNeeded} joined
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-[10px] lg:text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full flex-1">
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link
                        to={`/complete/${task.id}`}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:from-[#4DA3FF]/80 hover:to-[#4CAF50]/80 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-[#4DA3FF]/20 text-center"
                      >
                        Accept Task
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
