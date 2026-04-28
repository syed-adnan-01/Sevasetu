import { useState, useEffect } from "react";
import { Clock, MapPin, Loader2, RefreshCw, FileText, Filter, ChevronRight } from "lucide-react";

export function ReportsHistory() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = Array.isArray(reports) ? reports.filter(report => {
    if (filter === "all") return true;
    if (filter === "critical") return report.urgencyScore > 70;
    if (filter === "pending") return report.status === "pending";
    return true;
  }) : [];

  return (
    <div className="min-h-full bg-[#0B0F14] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Report History</h1>
            <p className="text-sm text-gray-400">View and manage all submissions from the field</p>
          </div>
          <div className="flex gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all text-sm border border-gray-700"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={fetchReports}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all text-sm"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Mobile filter dropdown */}
        {showFilters && (
          <div className="sm:hidden mb-4 bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2">
              {["all", "critical", "pending", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setShowFilters(false); }}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    filter === f
                      ? "bg-[#4DA3FF]/10 text-[#4DA3FF] border border-[#4DA3FF]/20"
                      : "text-gray-400 bg-gray-800/50 border border-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Desktop Sidebar Filters */}
          <div className="hidden sm:block md:col-span-1 space-y-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={16} />
                Filters
              </h3>
              <div className="space-y-1">
                {["all", "critical", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                      filter === f
                        ? "bg-[#4DA3FF]/10 text-[#4DA3FF] border border-[#4DA3FF]/20"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 className="animate-spin mb-4 text-[#4DA3FF]" size={40} />
                <p className="text-base">Connecting to MongoDB...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <FileText size={40} className="text-gray-700 mb-4" />
                <p className="text-gray-500 text-base">No reports found matching these filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#4DA3FF]/50 transition-all duration-300 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {report.image && (
                        <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0">
                          <img
                            src={report.image}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            alt="Evidence"
                          />
                        </div>
                      )}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                              report.urgencyScore > 70 ? "bg-[#FF4D4D]/20 text-[#FF4D4D]" : "bg-[#4CAF50]/20 text-[#4CAF50]"
                            }`}>
                              {report.urgencyScore > 70 ? "Critical" : "Stable"}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(report.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-100 text-sm sm:text-base font-medium mb-3 line-clamp-2">
                            {report.description || "No description provided."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-700/50 pt-3 mt-auto flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <MapPin size={12} />
                            <span>
                              Lat: {report.location?.lat?.toFixed(2) ?? 'N/A'}, Lng: {report.location?.lng?.toFixed(2) ?? 'N/A'}
                            </span>
                          </div>
                          <button className="flex items-center gap-1 text-[#4DA3FF] text-xs sm:text-sm font-semibold hover:gap-2 transition-all">
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
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
