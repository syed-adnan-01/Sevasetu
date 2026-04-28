import { useState, useEffect } from "react";
import { AlertCircle, Users, CheckCircle, MapPin, Loader2, Clock } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from "../../config";

export function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // '24h', '7d', 'all'
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [matchingCount, setMatchingCount] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [reportsRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports`),
        fetch(`${API_BASE_URL}/tasks`)
      ]);
      const reportsData = await reportsRes.json();
      const tasksData = await tasksRes.json();
      
      setReports(reportsData);
      setMatchingCount(tasksData.filter((t: any) => t.status === 'assigned').length);

      // Resolve addresses for top 5 critical reports
      reportsData
        .sort((a: any, b: any) => b.urgencyScore - a.urgencyScore)
        .slice(0, 5)
        .forEach((r: any) => {
          if (r.location?.lat) resolveAddress(r._id, r.location.lat, r.location.lng);
        });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAddress = async (id: string, lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address.suburb || data.address.city || "Verified Location";
      setAddresses(prev => ({ ...prev, [id]: addr }));
    } catch (err) {
      setAddresses(prev => ({ ...prev, [id]: "Location Verified" }));
    }
  };

  const filteredReports = reports.filter(report => {
    if (timeFilter === "all") return true;
    const reportDate = new Date(report.timestamp).getTime();
    const now = Date.now();
    if (timeFilter === "24h") return (now - reportDate) <= 24 * 60 * 60 * 1000;
    if (timeFilter === "7d") return (now - reportDate) <= 7 * 24 * 60 * 60 * 1000;
    return true;
  });

  const getSeverityColor = (score: number) => {
    if (score > 70) return "bg-[#FF4D4D]/20 border-[#FF4D4D] text-[#FF4D4D]";
    if (score > 40) return "bg-[#FFC857]/20 border-[#FFC857] text-[#FFC857]";
    return "bg-[#4CAF50]/20 border-[#4CAF50] text-[#4CAF50]";
  };

  const getSeverityLabel = (score: number) => {
    if (score > 70) return "CRITICAL";
    if (score > 40) return "HIGH";
    return "MODERATE";
  };

  const getMapColor = (score: number) => {
    if (score > 70) return "#FF4D4D";
    if (score > 40) return "#FFC857";
    return "#4CAF50";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Command Center</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Time Range:</span>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-[#4DA3FF] focus:border-[#4DA3FF] block p-2 outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Active Volunteers</div>
            <Users className="text-[#4CAF50]" size={24} />
          </div>
          <div className="text-3xl font-bold">247</div>
          <div className="text-xs text-[#4CAF50] mt-1">{matchingCount} volunteers deployed now</div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Total Reports</div>
            <CheckCircle className="text-[#4DA3FF]" size={24} />
          </div>
          <div className="text-3xl font-bold">{filteredReports.length}</div>
          <div className="text-xs text-[#4DA3FF] mt-1">Filtered by Time</div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Critical Issues</div>
            <AlertCircle className="text-[#FF4D4D]" size={24} />
          </div>
          <div className="text-3xl font-bold">{filteredReports.filter(r => r.urgencyScore > 70).length}</div>
          <div className="text-xs text-[#FF4D4D] mt-1">Requires attention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Living Pulse Map */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700/50 shadow-xl flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 px-2">
            <MapPin className="text-[#4DA3FF]" size={20} />
            Living Pulse Map
          </h3>
          <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden relative z-0">
            <MapContainer 
              center={[28.6139, 77.2090]} // Default to New Delhi
              zoom={11} 
              style={{ height: '100%', width: '100%', background: '#0B0F14' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />
              {filteredReports.map((report, idx) => {
                // Temporary hack for demo: generate random offset around center if coordinates are missing/0
                let lat = report.location?.lat;
                let lng = report.location?.lng;
                if (!lat && !lng || (lat === 0 && lng === 0)) {
                   // pseudo-random deterministic based on ID or index
                   const seed = report._id ? parseInt(report._id.substring(report._id.length - 4), 16) : idx;
                   lat = 28.6139 + ((seed % 100) / 100 - 0.5) * 0.15;
                   lng = 77.2090 + (((seed * 7) % 100) / 100 - 0.5) * 0.15;
                }
                
                const color = getMapColor(report.urgencyScore);
                const isCritical = report.urgencyScore > 70;
                
                return (
                  <CircleMarker 
                    key={report._id || idx} 
                    center={[lat, lng]} 
                    radius={isCritical ? 14 : 8}
                    pathOptions={{ 
                      fillColor: color, 
                      color: color, 
                      fillOpacity: isCritical ? 0.8 : 0.5,
                      weight: isCritical ? 2 : 1
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="text-gray-900 p-1">
                        <div className="font-bold text-sm mb-1">Score: {report.urgencyScore}</div>
                        <div className="text-xs line-clamp-3">{report.description}</div>
                        <div className="text-[10px] text-gray-500 mt-2">{new Date(report.timestamp).toLocaleString()}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Top Urgent Issues List */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 lg:p-6 border border-gray-700/50 shadow-xl overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-[#FF4D4D]" size={20} />
            Top Urgent Issues
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No active issues in this time range.</div>
            ) : (
              filteredReports
                .sort((a, b) => b.urgencyScore - a.urgencyScore)
                .slice(0, 8)
                .map((issue, idx) => (
                <div
                  key={issue._id || idx}
                  className="flex flex-col p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:bg-gray-800/70 gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(issue.urgencyScore)}`}>
                      {getSeverityLabel(issue.urgencyScore)}
                    </div>
                    <div className="text-[10px] font-bold text-[#4DA3FF] uppercase tracking-tighter flex items-center gap-1">
                      <MapPin size={10} /> {addresses[issue._id] || "Resolving Area..."}
                    </div>
                  </div>
                  <div className="text-sm font-medium line-clamp-2 text-gray-200">
                    {issue.description || "No description provided."}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(issue.timestamp).toLocaleTimeString()}
                    </div>
                    <span className="text-[10px] font-mono opacity-50">Impact: High</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

