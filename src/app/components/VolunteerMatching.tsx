import { useState, useEffect } from "react";
import { User, ShieldCheck, MapPin, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AVAILABLE_SKILLS = [
  "Medical", "First Aid", "Doctor", "Nurse", 
  "Logistics", "Driving", "Engineering", 
  "Heavy Machinery", "Search & Rescue", 
  "Communication", "Observation"
];

export function VolunteerMatching() {
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // In a real app we'd fetch the user's existing skills first.
      // For demo, we'll just fetch recommendations based on whatever is selected.
      fetchRecommendations();
    }
  }, [user]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const saveProfileAndSearch = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      // 1. Update Profile
      await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          skills: selectedSkills,
          // Simulate a location for the volunteer near New Delhi
          location: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 }
        })
      });

      // 2. Fetch Recommendations
      await fetchRecommendations();
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/recommendations?email=${user.email}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email })
      });
      // Remove from list or refresh
      fetchRecommendations();
    } catch(err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50">
          <User className="mx-auto h-16 w-16 text-gray-500 mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please log in or sign up to view volunteer matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar: Profile & Skills */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA3FF] to-[#4CAF50] flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-xs text-gray-400">Volunteer</p>
            </div>
          </div>
          
          <h4 className="font-medium text-sm text-gray-300 mb-3 uppercase tracking-wider">My Skills</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {AVAILABLE_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedSkills.includes(skill)
                    ? "bg-[#4DA3FF]/20 border-[#4DA3FF] text-[#4DA3FF]"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          <button
            onClick={saveProfileAndSearch}
            disabled={isUpdating}
            className="w-full py-3 bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] hover:opacity-90 rounded-xl font-bold text-sm transition-opacity flex items-center justify-center gap-2"
          >
            {isUpdating ? "Updating..." : "Find Matches"}
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: Recommendations */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="text-[#4CAF50]" size={28} />
          Smart Matches
        </h2>
        <p className="text-gray-400 text-sm mb-6">Tasks recommended for you based on skills and proximity.</p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DA3FF]"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-gray-700/50">
            <CheckCircle2 className="mx-auto h-16 w-16 text-gray-500 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300">No matches right now</h3>
            <p className="text-gray-500 mt-2">Try updating your skills or checking back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(task => (
              <div key={task._id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 hover:border-[#4DA3FF]/50 transition-colors flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{task.title}</h3>
                    {task.urgencyScore > 70 && (
                      <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {task.requiredSkills.map((skill: string) => (
                      <span key={skill} className={`px-2 py-1 rounded border ${
                        task.matchedSkills?.includes(skill)
                          ? "bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]"
                          : "bg-gray-700/50 border-gray-600 text-gray-400"
                      }`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col items-end gap-3 shrink-0">
                  <div className="text-sm font-semibold bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700/50 text-[#4DA3FF]">
                    {task.matchScore} Match Score
                  </div>
                  <button 
                    onClick={() => acceptTask(task._id)}
                    className="w-full sm:w-auto px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Accept Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
