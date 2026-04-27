import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  
  if (!user || user.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
