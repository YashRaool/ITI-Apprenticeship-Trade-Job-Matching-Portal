import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { Briefcase, CheckCircle2, Shield, Sparkles, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function redirectByRole(role?: string) {
    if (role === "employer") navigate("/employer/dashboard", { replace: true });
    else if (role === "admin") navigate("/admin/dashboard", { replace: true });
    else navigate("/student/dashboard", { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const me = await import("../lib/api").then((m) =>
        m.api.get<{ success: boolean; data: { userId: string; role: string } }>("/auth/me")
      );
      redirectByRole(me.data.data.role);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      const me = await import("../lib/api").then((m) =>
        m.api.get<{ success: boolean; data: { userId: string; role: string } }>("/auth/me")
      );
      redirectByRole(me.data.data.role);
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-ink-primary selection:bg-teal selection:text-white" style={{ background: 'var(--color-bg)' }}>
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ── Left Panel (Desktop only) ── */}
      <div
        className="relative hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between p-12 text-white overflow-hidden border-r"
        style={{
          background: 'linear-gradient(135deg, var(--auth-panel-from) 0%, var(--auth-panel-via) 50%, var(--auth-panel-to) 100%)',
          borderColor: 'var(--color-teal-dark)',
        }}
      >
        {/* Ambient glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--color-teal-glow)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--color-sky-glow)' }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--color-teal-subtle)', border: '1px solid rgba(53,208,194,0.4)' }}
          >
            <Briefcase size={21} style={{ color: 'var(--color-teal-light)' }} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              ITI<span style={{ color: 'var(--color-teal-light)' }}>Careers</span>
            </span>
            <span
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: 'rgba(53,208,194,0.7)' }}
            >
              National Trade Matching
            </span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'rgba(53,208,194,0.10)', border: '1px solid rgba(53,208,194,0.25)', color: 'var(--color-teal-light)' }}
          >
            <Sparkles size={13} style={{ color: 'var(--color-sky)' }} />
            Career Momentum Platform
          </div>

          <h2 className="text-4xl xl:text-[2.7rem] font-extrabold text-white tracking-tight leading-tight mb-5">
            Turn your trade certification into an{" "}
            <span
              style={{ color: 'var(--color-teal-light)', textDecoration: 'underline wavy', textDecorationColor: 'rgba(246,183,60,0.6)', textDecorationThickness: 2 }}
            >
              active career
            </span>.
          </h2>

          <p className="text-sm text-white/70 mb-8 leading-relaxed">
            Directly connect ITI graduates across India with certified industrial workshops, automotive centers, and fabrication firms.
          </p>

          {/* Floating feature cards */}
          <div className="space-y-3">
            {[
              {
                icon: <CheckCircle2 size={17} />,
                iconBg: 'rgba(15,138,134,0.35)',
                iconColor: 'var(--color-teal-light)',
                title: 'Verified ITI Certification Matching',
                desc: 'Employer-verified documents with instant trade validation',
                delay: 0.08,
                floatDelay: '0s',
              },
              {
                icon: <TrendingUp size={17} />,
                iconBg: 'rgba(246,183,60,0.22)',
                iconColor: 'var(--color-sky)',
                title: 'Direct Apprentice Onboarding',
                desc: 'Connect directly with certified workshop managers',
                delay: 0.16,
                floatDelay: '1.5s',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay, duration: 0.28 }}
                className="animate-float-subtle flex items-center gap-3 p-3.5 rounded-xl backdrop-blur-sm shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  animationDelay: item.floatDelay,
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.iconBg, color: item.iconColor }}>
                  {item.icon}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
          <span className="flex items-center gap-1.5">
            <Shield size={13} style={{ color: 'var(--color-teal-light)' }} />
            Standardized NCVT &amp; SCVT Alignment
          </span>
          <span>© 2026 ITI Career Portal</span>
        </div>
      </div>

      {/* ── Right Panel: Auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand bar */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-teal-subtle)', border: '1px solid var(--color-teal)', color: 'var(--color-teal)' }}>
              <Briefcase size={17} />
            </div>
            <span className="font-bold text-lg text-ink-primary">
              ITI<span style={{ color: 'var(--color-teal)' }}>Careers</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-base-surface border border-base-border rounded-2xl p-7 sm:p-9 shadow-card">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">Welcome back</h1>
              <p className="text-sm text-ink-secondary mt-1">Access your candidate dashboard or employer workshop</p>
            </div>

            {/* Tab bar */}
            <div className="relative flex p-1 rounded-xl bg-base-muted border border-base-border mb-6">
              <button
                type="button"
                className="relative flex-1 py-2 text-xs sm:text-sm font-semibold text-ink-primary text-center rounded-lg z-10"
              >
                Sign In
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute inset-0 bg-base-surface border border-base-border rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              </button>
              <Link
                to="/register"
                className="relative flex-1 py-2 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary text-center rounded-lg transition-colors"
              >
                Create Account
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="auth-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="auth-input"
                  autoComplete="current-password"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-3 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--color-status-red-bg)', border: '1px solid var(--color-status-red-border)', color: 'var(--color-status-red)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="auth-btn-primary mt-2">
                {loading ? "Signing in…" : "Sign In to Portal"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-border" />
              </div>
              <div className="relative flex justify-center text-xs text-ink-muted">
                <span className="bg-base-surface px-3">or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Google sign-in failed")}
                theme="outline"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>

            <p className="text-center text-xs sm:text-sm text-ink-secondary mt-6">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-teal font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
