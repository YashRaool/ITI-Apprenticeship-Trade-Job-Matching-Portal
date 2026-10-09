import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Redirects to role dashboard if logged in, otherwise to /login */
export default function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const dest = user.role === "employer"
    ? "/employer/dashboard"
    : user.role === "admin"
    ? "/admin/dashboard"
    : "/student/dashboard";
  return <Navigate to={dest} replace />;
}
