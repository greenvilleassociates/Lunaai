import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export function ProtectedRoute() {
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

  return <Outlet />;
}
