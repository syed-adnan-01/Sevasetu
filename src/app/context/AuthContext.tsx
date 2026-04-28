import { createContext, useContext, useState, ReactNode } from "react";
import { API_BASE_URL } from "../../config";

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("sevasetu_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      const newUser = { email: data.user.email, name: data.user.name, role: data.user.role };
      setUser(newUser);
      localStorage.setItem("sevasetu_user", JSON.stringify(newUser));
      localStorage.setItem("sevasetu_token", data.token);
    } catch(err) {
      console.error("Login failed:", err);
      throw err;
    }
  };
  
  const signup = async (name: string, email: string, password?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      const newUser = { email: data.user.email, name: data.user.name, role: data.user.role };
      setUser(newUser);
      localStorage.setItem("sevasetu_user", JSON.stringify(newUser));
      localStorage.setItem("sevasetu_token", data.token);
    } catch(err) {
      console.error("Signup failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sevasetu_user");
    localStorage.removeItem("sevasetu_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
