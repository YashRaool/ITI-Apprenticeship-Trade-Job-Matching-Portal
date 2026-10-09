import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { Briefcase, GraduationCap, Building2, Sparkles, UserCheck } from "lucide-react";

type Role = "student" | "employer";

const ROLE_FORM_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, role);
      navigate(role === "student" ? "/student/dashboard" : "/employer/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Registration failed. Please check your details and try again.";
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
      navigate("/student/dashboard", { replace: true });
    } catch {
      setError("Google sign-up failed. Please try again.");
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

      {/* ── Left Panel (Desktop) ── */}
      <div
        className="relative hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between p-12 text-white overflow-hidden border-r"
        style={{
          background: 'linear-gradient(135deg, var(--auth-panel-from) 0%, var(--auth-panel-via) 50%, var(--auth-panel-to) 100%)',
          borderColor: 'var(--color-teal-dark)',
        }}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--color-teal-glow)' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--color-sky-glow)' }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--color-teal-subtle)', border: '1px solid rgba(53,208,194,0.4)' }}>
            <Briefcase size={21} style={{ color: 'var(--color-teal-light)' }} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              ITI<span style={{ color: 'var(--color-teal-light)' }}>Careers</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: 'rgba(53,208,194,0.7)' }}>
              Vocational Career Launchpad
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'rgba(53,208,194,0.10)', border: '1px solid rgba(53,208,194,0.25)', color: 'var(--color-teal-light)' }}
          >
            <Sparkles size={13} style={{ color: 'var(--color-sky)' }} />
            Fast-Track Verification
          </div>

          <h2 className="text-4xl xl:text-[2.7rem] font-extrabold text-white tracking-tight leading-tight mb-5">
            Start your trade journey with{" "}
            <span style={{ color: 'var(--color-teal-light)', textDecoration: 'underline wavy', textDecorationColor: 'rgba(246,183,60,0.6)', textDecorationThickness: 2 }}>
              instant visibility
            </span>.
          </h2>

          <p className="text-sm text-white/70 mb-8 leading-relaxed">
            Create a profile as an ITI trainee or register your certified workshop to post apprentice opportunities in under two minutes.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <GraduationCap size={22} style={{ color: 'var(--color-teal-light)' }} />, title: 'For Trainees', desc: 'Upload trade certificates, find certified jobs, track applications live.', delay: '0s' },
              { icon: <Building2 size={22} style={{ color: 'var(--color-sky)' }} />, title: 'For Employers', desc: 'Post openings, verify certified trades, shortlist verified candidates.', delay: '1.5s' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.08, duration: 0.28 }}
                className="animate-float-subtle p-4 rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', animationDelay: item.delay }}
              >
                <div className="mb-2">{item.icon}</div>
                <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
          <span className="flex items-center gap-1.5">
            <UserCheck size={13} style={{ color: 'var(--color-teal-light)' }} />
            Empowering Skilled Vocational Careers
          </span>
          <span>© 2026 ITI Career Portal</span>
        </div>
      </div>

      {/* ── Right Panel: Registration form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-teal-subtle)', border: '1px solid var(--color-teal)', color: 'var(--color-teal)' }}>
              <Briefcase size={17} />
            </div>
            <span className="font-bold text-lg text-ink-primary">
              ITI<span style={{ color: 'var(--color-teal)' }}>Careers</span>
            </span>
          </div>

          <div className="bg-base-surface border border-base-border rounded-2xl p-7 sm:p-9 shadow-card">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">Create Account</h1>
              <p className="text-sm text-ink-secondary mt-1">Choose your role to get matched with the right opportunities</p>
            </div>

            {/* Tab bar */}
            <div className="relative flex p-1 rounded-xl bg-base-muted border border-base-border mb-6">
              <Link
                to="/login"
                className="relative flex-1 py-2 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary text-center rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <button type="button" className="relative flex-1 py-2 text-xs sm:text-sm font-semibold text-ink-primary text-center rounded-lg z-10">
                Create Account
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute inset-0 bg-base-surface border border-base-border rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              </button>
            </div>

            {/* Role switcher */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { r: 'student' as Role, icon: <GraduationCap size={15} />, label: 'ITI Trainee' },
                  { r: 'employer' as Role, icon: <Building2 size={15} />, label: 'Employer' },
                ] as const).map(({ r, icon, label }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer`}
                    style={role === r ? {
                      background: 'var(--color-teal-subtle)',
                      border: '1px solid var(--color-teal)',
                      color: 'var(--color-teal)',
                    } : {
                      background: 'var(--color-muted)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-ink-secondary)',
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role-specific form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={role}
                variants={ROLE_FORM_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.19 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
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
                    Password <span className="text-ink-muted lowercase font-normal">(min 8 characters)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="auth-input"
                    autoComplete="new-password"
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
                  {loading ? "Creating Account…" : `Register as ${role === "student" ? "Trainee" : "Employer"}`}
                </button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-border" />
              </div>
              <div className="relative flex justify-center text-xs text-ink-muted">
                <span className="bg-base-surface px-3">or continue with</span>
              </div>
            </div>

            {/* Google */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Google sign-up failed")}
                theme="outline"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>

            <p className="text-center text-xs sm:text-sm text-ink-secondary mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-teal font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
