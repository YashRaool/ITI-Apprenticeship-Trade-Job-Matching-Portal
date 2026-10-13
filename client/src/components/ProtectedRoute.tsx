import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  roles?: Array<"student" | "employer" | "admin">;
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // wait for session restore

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role as "student" | "employer" | "admin")) {
    const targetDashboard =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "employer"
        ? "/employer/dashboard"
        : "/student/dashboard";

    return (
      <Navigate
        to={`${targetDashboard}?denied=1`}
        replace
        state={{
          accessDenied: true,
          from: location.pathname,
          userRole: user.role,
        }}
      />
    );
  }

  return <>{children}</>;
}
