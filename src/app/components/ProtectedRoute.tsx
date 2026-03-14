import { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      navigate("/login");
    }
  }, [navigate]);

  const uid = localStorage.getItem("uid");
  
  if (!uid) {
    return null;
  }

  return <>{children}</>;
}