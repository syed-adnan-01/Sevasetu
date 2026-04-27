import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, FileText, ListTodo, Users, BarChart3, Bell, User, Menu, X } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/tasks", icon: ListTodo, label: "Tasks" },
    { path: "/volunteers", icon: Users, label: "Volunteers" },
    { path: "/admin", icon: BarChart3, label: "Analytics" },
  ];

  const NavContent = () => (
    <>
      <div className="h-20 p-6 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] to-[#4CAF50] bg-clip-text text-transparent">
          Seva-Setu
        </h1>
        <button 
          className="lg:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <p className="text-xs text-gray-500 mb-1">Signed in as</p>
          <p className="text-sm font-medium">Administrator</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0B0F14] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#111827] border-r border-gray-800 flex-col">
        <NavContent />
      </aside>

      {/* Mobile Menu Overlay */}
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-[#111827]/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-100">
              {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D4D] rounded-full border-2 border-[#111827]"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4DA3FF] to-[#4CAF50] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                <User size={20} className="text-[#4DA3FF]" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0B0F14] relative">
          {/* Global Background Grid */}
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
      </main>
    </div>
  );
}
