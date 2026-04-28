import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ArrowRight, ShieldCheck, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900/90 backdrop-blur-2xl border-zinc-800 p-0 overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative p-8">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4"
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Welcome Back
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2 text-sm text-center">
              Access the Seva-Setu portal to continue your mission
            </DialogDescription>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <Link to="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-xl h-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 border-0 mt-4 group transition-all"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center bg-zinc-950/30 -mx-8 -mb-8 p-6 rounded-b-3xl border-t border-zinc-800/50">
            <p className="text-sm text-zinc-400">
              New to Seva-Setu?{" "}
              <Link
                to="/signup"
                onClick={onClose}
                className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
