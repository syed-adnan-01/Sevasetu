import { motion } from "motion/react";
import { Lock, ArrowRight, ShieldAlert, X, Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onClose();
      navigate("/app/admin"); // Direct jump to admin panel
    } catch (err: any) {
      console.error(err);
      setError("Invalid administrative credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-amber-500/30 p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <div className="relative p-10 pt-12">
          {/* Decorative background for Admin */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-6"
            >
              <ShieldAlert className="w-10 h-10 text-black" />
            </motion.div>
            <DialogTitle className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-base max-w-[280px]">
              Secure gateway for Seva-Setu administrators and coordinators.
            </DialogDescription>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Admin Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 bg-zinc-900 border-zinc-800 focus:border-amber-500/50 text-white rounded-2xl h-14 transition-all"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Secret Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 bg-zinc-900 border-zinc-800 focus:border-amber-500/50 text-white rounded-2xl h-14 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 mt-4 group"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Unlock Portal</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-600 font-medium uppercase tracking-widest">
            Restricted System • Unauthorized access is logged
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
