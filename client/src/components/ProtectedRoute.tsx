import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  roles?: Array<"student" | "employer" | "admin">;
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // wait for session restore

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role as "student" | "employer" | "admin")) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
