import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "student" | "employer";

export default function AuthModal() {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const authMode = searchParams.get("auth");
  const isOpen = authMode === "signin" || authMode === "register";
  const isRegister = authMode === "register";
  const roleParam = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>((roleParam as Role) === "employer" ? "employer" : "student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam === "employer") setRole("employer");
    else if (roleParam === "student") setRole("student");
  }, [roleParam]);

  const onClose = () => {
    setSearchParams(params => {
      params.delete("auth");
      params.delete("role");
      return params;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  function formatAuthError(err: unknown, isReg: boolean, isGoogle = false): string {
    if (!err || typeof err !== "object") {
      return isGoogle
        ? "Google authentication failed. Please try again."
        : isReg
        ? "Registration failed. Please check your details."
        : "Invalid email or password.";
    }

    const anyErr = err as {
      code?: string;
      message?: string;
      response?: {
        status?: number;
        data?: {
          message?: string;
          errors?: Record<string, string[] | undefined>;
        };
      };
    };

    if (anyErr.code === "ECONNABORTED" || anyErr.message?.toLowerCase().includes("timeout")) {
      return "Server response timed out. The backend instance may be waking up—please try again in a few moments.";
    }
    if (!anyErr.response || anyErr.code === "ERR_NETWORK" || anyErr.message?.toLowerCase().includes("network error")) {
      return "Unable to connect to the server. Please check your network connection and verify the backend service is running.";
    }

    const status = anyErr.response.status;
    const data = anyErr.response.data;

    if (status === 429) {
      return data?.message || "Too many attempts. Please wait a few moments before trying again.";
    }
    if (status === 401) {
      if (isGoogle) return data?.message || "Google token verification failed. Please try signing in again.";
      return data?.message || (isReg ? "Registration failed. Invalid credentials." : "Invalid email or password.");
    }
    if (status === 403) {
      return data?.message || "Account access is deactivated. Please contact support.";
    }
    if (status === 409) {
      return data?.message || "An account with this email address already exists. Please sign in instead.";
    }
    if (status === 501 && isGoogle) {
      return "Google Sign-In is not configured on this server. Please use email and password.";
    }
    if (status && status >= 500) {
      return "Server error occurred. Please try again in a moment.";
    }

    if (data?.errors && typeof data.errors === "object") {
      const errorStrings = Object.values(data.errors).flat().filter(Boolean);
      if (errorStrings.length > 0) return errorStrings.join(". ");
    }

    if (data?.message && typeof data.message === "string") {
      return data.message;
    }

    return isGoogle
      ? "Google authentication failed. Please try again."
      : isReg
      ? "Registration failed. Please check your details."
      : "Invalid email or password.";
  }

  function redirectByRole(assignedRole?: string) {
    if (assignedRole === "employer") navigate("/employer/dashboard", { replace: true });
    else if (assignedRole === "admin") navigate("/admin/dashboard", { replace: true });
    else navigate("/student/dashboard", { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const authedUser = await register(email, password, role);
        redirectByRole(authedUser.role);
      } else {
        const authedUser = await login(email, password);
        redirectByRole(authedUser.role);
      }
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err, isRegister));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setError("No credential received from Google. Please try again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const authedUser = await googleLogin(credentialResponse.credential);
      redirectByRole(authedUser.role);
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err, isRegister, true));
    } finally {
      setLoading(false);
    }
  }

  const toggleMode = () => {
    setSearchParams(params => {
      params.set("auth", isRegister ? "signin" : "register");
      return params;
    });
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172033]/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white rounded-2xl w-full max-w-md p-8 relative border border-[#E5EAF2] shadow-xl overflow-y-auto max-h-screen"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[#667085] hover:text-[#172033] transition-colors p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-[#172033] mb-2 text-center">
              {isRegister ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-[#667085] text-center mb-6 text-sm">
              {isRegister ? "Choose your role to get matched with the right opportunities." : "Welcome back! Please sign in to continue."}
            </p>
            
            {isRegister && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("student")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${role === "student" ? "bg-[#F8FBFF] border-[#2563EB] text-[#2563EB] shadow-sm" : "bg-white border-[#E5EAF2] text-[#667085] hover:border-slate-300"}`}
                  >
                    <GraduationCap size={15} />
                    <span>Trainee</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("employer")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${role === "employer" ? "bg-[#F8FBFF] border-[#2563EB] text-[#2563EB] shadow-sm" : "bg-white border-[#E5EAF2] text-[#667085] hover:border-slate-300"}`}
                  >
                    <Building2 size={15} />
                    <span>Employer</span>
                  </motion.button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[#172033] bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#667085] uppercase tracking-wider mb-1.5">
                  Password {isRegister && <span className="text-[#667085] lowercase font-normal">(min 8 chars)</span>}
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 8 : undefined}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all text-[#172033] bg-gray-50 focus:bg-white"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={loading ? {} : { y: -1, scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {loading ? (isRegister ? "Creating Account…" : "Signing in…") : (isRegister ? `Register as ${role === "student" ? "Trainee" : "Employer"}` : "Sign In to Portal")}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5EAF2]" />
              </div>
              <div className="relative flex justify-center text-xs text-[#667085]">
                <span className="bg-white px-3">or continue with</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() =>
                    setError(
                      "Google Sign-In failed or was blocked by browser. Please check popup permissions and authorized origins in Google Cloud Console."
                    )
                  }
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  width="100%"
                />
              ) : (
                <div className="w-full text-center py-2.5 px-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800">
                  Google Sign-In is unavailable (OAuth Client ID pending configuration in Render environment).
                </div>
              )}
            </div>

            <p className="text-center text-sm text-[#667085] mt-6">
              {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
              <button onClick={toggleMode} className="text-[#2563EB] font-semibold hover:underline cursor-pointer">
                {isRegister ? "Sign in here" : "Create an account"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
