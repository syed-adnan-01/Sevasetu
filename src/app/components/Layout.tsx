import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, FileText, ListTodo, Users, BarChart3, Bell, User, Menu, X, Camera, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../../config";

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        const data = await response.json();
        const cleared = new Set(JSON.parse(localStorage.getItem('cleared_notifications') || '[]'));
        const activeTasks = data.filter((task: any) => !cleared.has(task._id));
        setNotifications(activeTasks.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const clearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentCleared = new Set(JSON.parse(localStorage.getItem('cleared_notifications') || '[]'));
    notifications.forEach(n => currentCleared.add(n._id));
    localStorage.setItem('cleared_notifications', JSON.stringify(Array.from(currentCleared)));
    setNotifications([]);
  };

  const navItems = [
    { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/app/reports", icon: Camera, label: "New Report" },
    { path: "/app/my-reports", icon: User, label: "My Complaints" },
    { path: "/app/history", icon: FileText, label: "Public Issues" },
    { path: "/app/tasks", icon: ListTodo, label: "Tasks" },
    { path: "/app/volunteers", icon: Users, label: "Volunteers" },
    { path: "/app/admin", icon: ShieldCheck, label: "Admin Panel", roles: ["admin"] },
    { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

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
        {filteredNavItems.map((item) => {
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
          <p className="text-xs text-gray-500 mb-1">{user ? "Signed in as" : "Not signed in"}</p>
          <p className="text-sm font-medium">{user ? user.name : "Guest"}</p>
        </div>
      </div>
    </>
  );

  const navigate = useNavigate();

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
              {filteredNavItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg relative transition-colors cursor-pointer">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D4D] rounded-full border-2 border-[#111827]"></span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[#111827] border-gray-800 text-gray-200 mt-2 z-50">
                <DropdownMenuLabel className="font-semibold text-gray-100 flex justify-between items-center">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#4DA3FF]/20 text-[#4DA3FF] px-2 py-0.5 rounded-full">{notifications.length} New</span>
                      <button 
                        onClick={clearAllNotifications}
                        className="text-[10px] uppercase font-bold tracking-wider text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notif: any) => (
                    <DropdownMenuItem 
                      key={notif._id} 
                      className="focus:bg-gray-800 focus:text-white cursor-pointer py-3 px-4 flex flex-col items-start gap-1 border-b border-gray-800/50 last:border-0"
                      onClick={() => navigate('/app/tasks')}
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className="text-sm font-medium text-gray-100">{notif.title}</span>
                        <span className="text-[10px] text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs text-gray-400 line-clamp-1">{notif.description}</span>
                    </DropdownMenuItem>
                  )) : (
                    <div className="py-4 text-center text-sm text-gray-500">No new notifications</div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem 
                      className="focus:bg-gray-800 focus:text-[#4DA3FF] text-[#4DA3FF] cursor-pointer py-2 justify-center font-medium"
                      onClick={() => navigate('/app/tasks')}
                    >
                      View All Tasks
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-[#4DA3FF] rounded-full transition-shadow">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4DA3FF] to-[#4CAF50] p-[2px] cursor-pointer hover:opacity-90">
                  <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                    <User size={20} className="text-[#4DA3FF]" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-gray-800 text-gray-200 mt-2">
                <DropdownMenuLabel className="font-semibold text-gray-100">
                  {user ? "My Account" : "Welcome visitor"}
                </DropdownMenuLabel>
                {user && (
                  <DropdownMenuLabel className="text-xs text-gray-400 font-normal pt-0 break-all">
                    {user.email}
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator className="bg-gray-800" />
                {user ? (
                  <>
                    <DropdownMenuItem 
                      className="focus:bg-gray-800 focus:text-white cursor-pointer py-2"
                      onClick={() => navigate('/app/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.name}'s Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem 
                      className="focus:bg-red-500/10 focus:text-red-400 text-red-500 cursor-pointer py-2"
                      onClick={() => { logout(); navigate("/"); }}
                    >
                      <User className="mr-2 h-4 w-4 opacity-0" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem 
                    className="focus:bg-gray-800 focus:text-white cursor-pointer py-2"
                    onClick={() => navigate("/login")}
                  >
                    <User className="mr-2 h-4 w-4 opacity-0" />
                    <span>Login</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
