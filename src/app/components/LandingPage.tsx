import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Globe, 
  Heart, 
  Zap,
  BarChart3,
  Camera
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { LoginModal } from "./LoginModal";
import { AdminLoginModal } from "./AdminLoginModal";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-blue-400" />,
      title: "Real-time Reporting",
      description: "Upload photographic evidence of issues with instant geolocation tagging."
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: "Volunteer Matching",
      description: "Smart algorithms connect local volunteers with tasks based on their proximity and skills."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "Impact Analytics",
      description: "Track progress and transparency with real-time dashboards for local authorities."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-orange-400" />,
      title: "Secure Verification",
      description: "Blockchain-inspired multi-step verification ensures task completion and accountability."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grain-y-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 pointer-events-none"></div>
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Seva-Setu
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAdminLoginOpen(true)}
            className="text-xs font-bold uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors mr-2"
          >
            Admin
          </button>
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <Link to="/signup">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 transition-all shadow-xl shadow-white/10">
              Join Us
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-sm">
              <Globe className="w-3 h-3" />
              <span>BRIDGING THE GAP BETWEEN CITIZENS AND AUTHORITIES</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
              Empowering Communities <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Through Digital Seva.
              </span>
            </h1>
            
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join a decentralized platform designed to solve local issues. Report problems, volunteer your skills, and build a better future together—all in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center gap-2 backdrop-blur-md">
                Learn More
              </button>
            </div>

            <div className="mt-20 relative">
               <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-xl"
               >
                 <div className="aspect-video bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070" 
                      alt="Community Impact" 
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                       <div className="text-left">
                         <div className="text-3xl font-bold font-mono">1,254+</div>
                         <div className="text-zinc-400 text-xs uppercase tracking-widest">Tasks Resolved</div>
                       </div>
                       <div className="text-right">
                         <div className="text-3xl font-bold font-mono">82%</div>
                         <div className="text-zinc-400 text-xs uppercase tracking-widest">Efficiency Increase</div>
                       </div>
                    </div>
                 </div>
               </motion.div>
               {/* Floating elements */}
               <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl hidden lg:block backdrop-blur-xl"
               >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">New Task Near You</div>
                      <div className="text-xs text-zinc-500">2 minutes ago in Sector 4</div>
                    </div>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-zinc-950/50">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Everything You Need</h2>
              <p className="text-zinc-400">Built with cutting-edge technology for social good.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[40px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 tracking-tight">Ready to make a difference?</h2>
            <p className="text-zinc-300 text-lg mb-10 relative z-10">Start your journey today and be the bridge to change in your community.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
               <Link to="/signup">
                <button className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors shadow-xl">
                  Create Account
                </button>
               </Link>
               <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-10 py-4 bg-transparent border border-white/20 hover:bg-white/5 rounded-2xl font-bold transition-colors"
              >
                  Partner With Us
               </button>
            </div>
          </div>
        </section> */}
      </main>

      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="font-bold tracking-tight">Seva-Setu</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs">A platform for public welfare and decentralized local governance reporting.</p>
          </div>
          
          <div className="flex gap-12">
             <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-300">Product</div>
                <div className="text-sm text-zinc-500 space-y-2 flex flex-col">
                   <a href="#" className="hover:text-white transition-colors">Features</a>
                   <a href="#" className="hover:text-white transition-colors">Safety</a>
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-300">Company</div>
                <div className="text-sm text-zinc-500 space-y-2 flex flex-col">
                   <a href="#" className="hover:text-white transition-colors">About Us</a>
                   <a href="#" className="hover:text-white transition-colors">Contact</a>
                   <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
           <p>© 2026 Seva-Setu. Built for India with ❤️</p>
           <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
           </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />
    </div>
  );
}
