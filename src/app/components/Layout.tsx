import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, FileText, ListTodo, Users, BarChart3, Bell, User, Menu, X, Camera } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/reports", icon: Camera, label: "New Report" },
    { path: "/history", icon: FileText, label: "History" },
    { path: "/tasks", icon: ListTodo, label: "Tasks" },
    { path: "/volunteers", icon: Users, label: "Volunteers" },
    { path: "/admin", icon: BarChart3, label: "Analytics" },
  ];

  const NavContent = () => (
    <>
      <div className="h-16 sm:h-20 p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
          Seva-Setu
        </h1>
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#4DA3FF]/10 text-[#4DA3FF] border border-[#4DA3FF]/20"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm sm:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t border-gray-800">
        <div className="p-3 sm:p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <p className="text-xs text-gray-500 mb-1">Signed in as</p>
          <p className="text-sm font-medium">Administrator</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0B0F14] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#111827] border-r border-gray-800 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-[#111827] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavContent />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 sm:h-16 bg-[#111827]/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            {/* Mobile Logo */}
            <span className="lg:hidden text-lg font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
              Seva-Setu
            </span>
            {/* Desktop Page Title */}
            <h2 className="hidden lg:block text-xl font-semibold text-gray-100">
              {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF4D4D] rounded-full"></span>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#4DA3FF] to-[#4CAF50] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                <User size={16} className="text-[#4DA3FF]" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#0B0F14] relative pb-16 lg:pb-0">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            backgroundPosition: '-1px -1px'
          }}></div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111827]/95 backdrop-blur-xl border-t border-gray-800">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                    isActive ? "text-[#4DA3FF]" : "text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
