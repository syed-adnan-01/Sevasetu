import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { Users, AlertTriangle, CheckCircle, TrendingUp, Filter, Download } from "lucide-react";
import { motion } from "motion/react";
import { API_BASE_URL } from "../../config";

const COLORS = ["#4DA3FF", "#4CAF50", "#FFC107", "#FF4D4D", "#9C27B0"];

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/reports`),
          fetch(`${API_BASE_URL}/tasks`)
        ]);
        
        const reports = await reportsRes.json();
        const tasks = await tasksRes.json();

        // Process data for charts
        const urgencyData = [
          { name: "Critical (80+)", value: reports.filter((r: any) => r.urgencyScore >= 80).length },
          { name: "High (50-79)", value: reports.filter((r: any) => r.urgencyScore >= 50 && r.urgencyScore < 80).length },
          { name: "Medium (30-49)", value: reports.filter((r: any) => r.urgencyScore >= 30 && r.urgencyScore < 50).length },
          { name: "Low (<30)", value: reports.filter((r: any) => r.urgencyScore < 30).length },
        ];

        const statusData = [
          { name: "Open", count: tasks.filter((t: any) => t.status === "open").length },
          { name: "Assigned", count: tasks.filter((t: any) => t.status === "assigned").length },
          { name: "Completed", count: tasks.filter((t: any) => t.status === "completed").length },
          { name: "Verified", count: tasks.filter((t: any) => t.verifiedByAdmin).length },
        ];

        setData({ reports, tasks, urgencyData, statusData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0B0F14]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4DA3FF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0B0F14] via-gray-900 to-[#0B0F14] p-6 lg:p-10 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
              Disaster Impact Analytics
            </h1>
            <p className="text-gray-400 mt-2">Real-time situational awareness and response tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm hover:bg-gray-700 transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#4DA3FF] text-black font-bold rounded-xl text-sm hover:bg-[#4DA3FF]/90 transition-all shadow-lg shadow-[#4DA3FF]/20">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Reports", value: data.reports.length, icon: AlertTriangle, color: "text-[#4DA3FF]", bg: "bg-[#4DA3FF]/10" },
            { label: "Resolved Cases", value: data.reports.filter((r: any) => r.status === "resolved").length, icon: CheckCircle, color: "text-[#4CAF50]", bg: "bg-[#4CAF50]/10" },
            { label: "Active Volunteers", value: 42, icon: Users, color: "text-[#FFC107]", bg: "bg-[#FFC107]/10" },
            { label: "Avg. Response Time", value: "12m", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="backdrop-blur-xl bg-gray-800/40 border border-gray-700/50 p-6 rounded-2xl hover:border-[#4DA3FF]/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Urgency Distribution (Pie) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-gray-800/40 border border-gray-700/50 p-8 rounded-3xl"
          >
            <h3 className="text-xl font-bold mb-6">Urgency Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.urgencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.urgencyData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Task Status (Bar) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-gray-800/40 border border-gray-700/50 p-8 rounded-3xl"
          >
            <h3 className="text-xl font-bold mb-6">Response Progress</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "12px" }}
                    cursor={{ fill: 'rgba(77, 163, 255, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4DA3FF" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-700/50 rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-gray-700/50 flex items-center justify-between">
            <h3 className="text-xl font-bold">Live Activity Log</h3>
            <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full animate-pulse">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider">
                  <th className="px-8 py-4 font-medium">Issue</th>
                  <th className="px-8 py-4 font-medium">Status</th>
                  <th className="px-8 py-4 font-medium">Urgency</th>
                  <th className="px-8 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {data.reports.slice(0, 5).map((report: any) => (
                  <tr key={report._id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-8 py-4 text-sm max-w-xs truncate">{report.description}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                        report.status === 'resolved' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#4DA3FF]/10 text-[#4DA3FF]'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#4DA3FF] to-[#FF4D4D]" 
                            style={{ width: `${report.urgencyScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono">{report.urgencyScore}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-500">
                      {new Date(report.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
