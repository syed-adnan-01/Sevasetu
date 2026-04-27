import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, FileText, ListTodo, Users, BarChart3, Bell, User } from "lucide-react";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/tasks", icon: ListTodo, label: "Tasks" },
    { path: "/volunteers", icon: Users, label: "Volunteers" },
    { path: "/admin", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-[#0B0F14] text-white">
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
            PulseGrid
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#4DA3FF]/20 text-[#4DA3FF] shadow-lg shadow-[#4DA3FF]/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DA3FF] to-[#4CAF50] flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <div className="text-sm font-medium">Alex Johnson</div>
              <div className="text-xs text-gray-400">Volunteer</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D4D] rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <User size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
