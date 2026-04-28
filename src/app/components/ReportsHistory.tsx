import { useState, useEffect } from "react";
import { Clock, MapPin, Loader2, RefreshCw, FileText, Search, Filter, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../../config";

export function ReportsHistory() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      const data = await response.json();
      setReports(data);
      
      // Background resolve all report locations
      data.forEach((report: any) => {
        if (report.location?.lat) resolveAddress(report._id, report.location.lat, report.location.lng);
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAddress = async (id: string, lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address.suburb || data.address.city || data.address.neighbourhood || "Verified Area";
      setAddresses(prev => ({ ...prev, [id]: addr }));
    } catch (err) {
      setAddresses(prev => ({ ...prev, [id]: `${lat.toFixed(2)}, ${lng.toFixed(2)}` }));
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === "all") return true;
    if (filter === "critical") return report.urgencyScore > 70;
    if (filter === "pending") return report.status === "pending";
    return true;
  });

  return (
    <div className="min-h-full bg-[#0B0F14] p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Public Issues</h1>
            <p className="text-gray-400">View and manage all issues grouped by location</p>
          </div>
          <button 
            onClick={fetchReports}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          <div className="w-full">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={16} />
                Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                {["all", "critical", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-lg text-sm capitalize transition-all border ${
                      filter === f 
                        ? "bg-[#4DA3FF]/10 text-[#4DA3FF] border-[#4DA3FF]/20" 
                        : "text-gray-400 border-transparent hover:bg-gray-800/50 hover:border-gray-700 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="animate-spin mb-4 text-[#4DA3FF]" size={48} />
                <p className="text-lg">Connecting to MongoDB...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <FileText size={48} className="text-gray-700 mb-4" />
                <p className="text-gray-500 text-lg">No reports found matching these filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {Object.entries(
                  filteredReports.reduce((acc: Record<string, any[]>, report) => {
                    const loc = report.location?.address || addresses[report._id] || "Unknown Location";
                    if (!acc[loc]) acc[loc] = [];
                    acc[loc].push(report);
                    return acc;
                  }, {})
                ).map(([locationName, locReports]) => (
                  <div key={locationName} className="bg-gray-900/20 p-6 rounded-3xl border border-gray-800/50">
                    <h2 className="text-xl font-bold text-[#4DA3FF] mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
                      <MapPin size={24} />
                      {locationName}
                      <span className="text-sm font-normal text-gray-500 bg-gray-900 px-3 py-1 rounded-full ml-auto">
                        {(locReports as any[]).length} issues
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {(locReports as any[]).map((report) => (
                        <div 
                          key={report._id}
                          className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#4DA3FF]/50 transition-all duration-300 shadow-xl hover:shadow-[#4DA3FF]/5"
                        >
                          <div className="flex flex-col sm:flex-row">
                            {report.image && (
                              <div className="sm:w-48 h-48 sm:h-auto shrink-0">
                                <img 
                                  src={report.image} 
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                  alt="Evidence" 
                                />
                              </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                                    report.urgencyScore > 70 ? "bg-[#FF4D4D]/20 text-[#FF4D4D]" : "bg-[#4CAF50]/20 text-[#4CAF50]"
                                  }`}>
                                    {report.urgencyScore > 70 ? "Critical" : "Stable"}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(report.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-100 text-lg font-medium mb-4 line-clamp-3">
                                  {report.description || "No description provided."}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between border-t border-gray-700/50 pt-4 mt-auto">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-gray-400 text-xs bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-800">
                                    <MapPin size={14} className="text-[#4CAF50]" />
                                    <span>{locationName}</span>
                                  </div>
                                </div>
                                <button className="flex items-center gap-1 text-[#4DA3FF] text-sm font-semibold hover:gap-2 transition-all">
                                  Details <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
