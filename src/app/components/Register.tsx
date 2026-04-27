import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (signup) {
        await signup(name, email, password);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-green-900/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-tr from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
            Create Account
          </h2>
          <p className="text-zinc-400 mt-2 text-sm text-center">
            Join the Seva-Setu platform today
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-zinc-500" />
              </div>
              <Input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-xl h-12"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-xl h-12"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-xl h-12"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 border-0 mt-4 group">
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </form>

        <div className="mt-8 text-center bg-zinc-950/30 -mx-8 -mb-8 p-6 rounded-b-3xl border-t border-zinc-800/50">
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
