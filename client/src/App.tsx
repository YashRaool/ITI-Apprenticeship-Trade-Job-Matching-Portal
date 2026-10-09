import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { JobSearchPage } from "./pages/JobSearchPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { JobApplicantsPage } from "./pages/JobApplicantsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function AuthRedirect({ mode }: { mode: 'signin' | 'register' }) {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const query = new URLSearchParams();
  query.set('auth', mode);
  if (type) query.set('role', type);
  return <Navigate to={`/?${query.toString()}`} replace />;
}

export default function App() {
  const location = useLocation();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-screen"
            >
              <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/login" element={<AuthRedirect mode="signin" />} />
            <Route path="/register" element={<AuthRedirect mode="register" />} />
            <Route path="/jobs" element={<JobSearchPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["student", "employer", "admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute roles={["employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/applicants"
              element={
                <ProtectedRoute roles={["employer"]}>
                  <JobApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute roles={["student", "employer"]}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
