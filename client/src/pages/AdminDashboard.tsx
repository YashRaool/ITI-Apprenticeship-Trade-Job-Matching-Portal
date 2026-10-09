import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Briefcase, CheckCircle2, AlertTriangle, BarChart3,
  ShieldCheck, Loader2, UserCheck, UserX, RefreshCw, Clock, Trash2,
  Search, Shield, Activity, X, TrendingUp, AlertCircle, Building2, UserCog, MessageSquare
} from "lucide-react";
import { AppNavbar } from "../components/ui/AppNavbar";
import {
  adminApi, Analytics, AdminUser, AdminEmployer, AdminJob, VerificationStatus,
} from "../lib/adminApi";
import { AdminMessagesPanel } from "../components/admin/AdminMessagesPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "analytics" | "employers" | "users" | "jobs" | "messages";


// ─── Animated Number Counter ──────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 650;
    const startTime = performance.now();
    let animationFrameId: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for ultra-smooth numeric ease
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(ease * end));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  title = "Confirm Action",
  message,
  confirmLabel,
  variant,
  onConfirm,
  onCancel,
  loading,
}: {
  title?: string;
  message: string;
  confirmLabel: string;
  variant: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-base-surface border border-base-border rounded-2xl p-6 max-w-md w-full shadow-card-hover relative overflow-hidden"
      >
        {/* Subtle accent header line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${variant === "danger" ? "bg-red-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`} />

        <div className="flex items-center gap-3.5 mb-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              variant === "danger"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20"
            }`}
          >
            {variant === "danger" ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary">{title}</h3>
            <p className="text-xs text-ink-muted">Administrative confirmation required</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-6 bg-base-muted/50 p-3.5 rounded-xl border border-base-border/50">
          {message}
        </p>

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-base-muted hover:bg-base-border/50 hover:text-ink-primary rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4.5 py-2 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/20"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  accentColor = "blue",
  badgeText,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor?: "blue" | "indigo" | "emerald" | "amber" | "red" | "gray";
  badgeText?: string;
  delay?: number;
}) {
  const colorMap = {
    blue:    { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-600 dark:text-blue-400", glow: "hover:border-blue-500/40 hover:shadow-blue-500/5" },
    indigo:  { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "text-indigo-600 dark:text-indigo-400", glow: "hover:border-indigo-500/40 hover:shadow-indigo-500/5" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400", glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/5" },
    amber:   { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-600 dark:text-amber-400", glow: "hover:border-amber-500/40 hover:shadow-amber-500/5" },
    red:     { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-600 dark:text-red-400", glow: "hover:border-red-500/40 hover:shadow-red-500/5" },
    gray:    { bg: "bg-base-muted", border: "border-base-border", icon: "text-ink-muted", glow: "hover:border-base-border" },
  };

  const theme = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative bg-base-surface border border-base-border rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all duration-200 ${theme.glow} group overflow-hidden`}
    >
      {/* Background soft glow gradient on hover */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-blue-500/5 blur-xl group-hover:scale-150 transition-transform duration-300 pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${theme.bg} ${theme.border} ${theme.icon}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between relative z-10">
        <p className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
          <AnimatedNumber value={value} />
        </p>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.bg} ${theme.border} ${theme.icon}`}>
            {badgeText}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function Badge({
  text,
  variant,
}: {
  text: string;
  variant: "success" | "warning" | "muted" | "danger" | "info" | "primary";
}) {
  const cls: Record<string, string> = {
    primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    muted:   "bg-base-muted text-ink-muted border-base-border",
    danger:  "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    info:    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cls[variant]} transition-all`}>
      {text}
    </span>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = "ghost",
  loading = false,
  title,
  size = "md",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "ghost" | "danger" | "primary" | "secondary" | "success";
  loading?: boolean;
  title?: string;
  size?: "sm" | "md";
}) {
  const cls: Record<string, string> = {
    ghost:     "bg-base-muted text-ink-secondary hover:text-ink-primary hover:bg-base-border/50 border border-base-border",
    secondary: "bg-base-surface text-ink-primary hover:border-blue-500/50 border border-base-border shadow-sm",
    danger:    "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/30",
    success:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30",
    primary:   "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-600 shadow-blue-600/20 shadow-sm",
  };

  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] ${pad} ${cls[variant]} ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
      }`}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : children}
    </button>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ data }: { data: Analytics }) {
  const appStatuses = Object.entries(data.applicationsByStatus);
  const totalApps = data.totalApplications || 1;

  const statusColors: Record<string, { bar: string; badge: "success" | "info" | "warning" | "danger" | "muted" }> = {
    submitted:    { bar: "bg-blue-500", badge: "info" },
    under_review: { bar: "bg-amber-500", badge: "warning" },
    shortlisted:  { bar: "bg-indigo-500", badge: "info" },
    interviewing: { bar: "bg-sky-500", badge: "info" },
    offered:      { bar: "bg-emerald-500", badge: "success" },
    rejected:     { bar: "bg-red-500", badge: "danger" },
    hired:        { bar: "bg-emerald-600", badge: "success" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <KpiCard label="Total Candidates" value={data.totalStudents} icon={<Users size={18} />} accentColor="blue" delay={0} />
        <KpiCard label="Total Employers" value={data.totalEmployers} icon={<Building2 size={18} />} accentColor="indigo" delay={0.03} />
        <KpiCard label="Verified Employers" value={data.totalVerifiedEmployers} icon={<ShieldCheck size={18} />} accentColor="emerald" badgeText="Verified" delay={0.06} />
        <KpiCard label="Pending Approval" value={data.totalPendingEmployers} icon={<Clock size={18} />} accentColor={data.totalPendingEmployers > 0 ? "amber" : "gray"} badgeText={data.totalPendingEmployers > 0 ? "Needs Action" : "All Clear"} delay={0.09} />
        <KpiCard label="Total Job Postings" value={data.totalJobs} icon={<Briefcase size={18} />} accentColor="blue" delay={0.12} />
        <KpiCard label="Open Positions" value={data.openJobs} icon={<TrendingUp size={18} />} accentColor="emerald" badgeText="Live" delay={0.15} />
        <KpiCard label="Applications Submitted" value={data.totalApplications} icon={<CheckCircle2 size={18} />} accentColor="indigo" delay={0.18} />
        <KpiCard label="Flagged Postings" value={data.flaggedJobs} icon={<AlertTriangle size={18} />} accentColor={data.flaggedJobs > 0 ? "red" : "gray"} badgeText={data.flaggedJobs > 0 ? "Action Required" : "Clean"} delay={0.21} />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Pipeline Breakdown */}
        <div className="lg:col-span-2 bg-base-surface border border-base-border rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-base-border">
            <div>
              <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <BarChart3 size={17} className="text-blue-500" />
                Application Pipeline Distribution
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Live status breakdown across all candidate submissions</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20">
              {data.totalApplications} Total Submissions
            </span>
          </div>

          {appStatuses.length === 0 ? (
            <div className="text-center py-8 text-ink-muted text-xs">No application telemetry registered yet.</div>
          ) : (
            <div className="space-y-4">
              {appStatuses.map(([status, count], idx) => {
                const pct = Math.round((count / totalApps) * 100);
                const conf = statusColors[status] || { bar: "bg-blue-600", badge: "muted" as const };
                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-primary capitalize flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${conf.bar}`} />
                        {status.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-primary">{count}</span>
                        <span className="text-[11px] text-ink-muted">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-base-muted rounded-full h-2.5 overflow-hidden p-0.5 border border-base-border/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 * idx }}
                        className={`h-full rounded-full ${conf.bar}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform Health Overview */}
        <div className="bg-base-surface border border-base-border rounded-2xl p-5 sm:p-6 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-border">
              <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <Activity size={17} className="text-indigo-500" />
                Platform Verification Health
              </h3>
            </div>

            <div className="space-y-4">
              {/* Employer verification rate gauge */}
              <div className="p-4 bg-base-muted/40 rounded-xl border border-base-border/70 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Employer Verification Ratio</span>
                  <span className="font-bold text-emerald-500">
                    {data.totalEmployers > 0 ? Math.round((data.totalVerifiedEmployers / data.totalEmployers) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-base-border rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.totalEmployers > 0 ? (data.totalVerifiedEmployers / data.totalEmployers) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  {data.totalVerifiedEmployers} of {data.totalEmployers} workshop profiles formally verified
                </p>
              </div>

              {/* Job posting safety status */}
              <div className="p-4 bg-base-muted/40 rounded-xl border border-base-border/70 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Job Moderation Ratio</span>
                  <span className={`font-bold ${data.flaggedJobs > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {data.flaggedJobs} Flagged
                  </span>
                </div>
                <div className="w-full bg-base-border rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.totalJobs > 0 ? Math.min(100, (data.flaggedJobs / data.totalJobs) * 100) : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${data.flaggedJobs > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  {data.openJobs} active job positions published & searchable
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-base-border flex items-center justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Automated Telemetry Active
            </span>
            <span>Real-time Sync</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Employers Panel ──────────────────────────────────────────────────────────
function EmployersPanel() {
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; approve: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listEmployers({
        verificationStatus: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: 12,
      });
      setEmployers(r.data.data);
      setTotalPages(r.data.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function handleVerify(id: string, approved: boolean) {
    setActioning(id);
    setConfirm(null);
    try {
      const r = await adminApi.verifyEmployer(id, approved);
      const updated = r.data.data;
      setEmployers(prev =>
        prev.map(e => e.id === id
          ? { ...e, verified: updated.verified, verificationStatus: updated.verificationStatus as VerificationStatus }
          : e
        )
      );
    } finally {
      setActioning(null);
    }
  }

  function verifBadge(status: VerificationStatus) {
    if (status === "verified") return <Badge text="✓ Verified" variant="success" />;
    if (status === "rejected") return <Badge text="✗ Rejected" variant="danger" />;
    return <Badge text="⏳ Pending Review" variant="warning" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Control bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-base-muted/30 p-3 rounded-2xl border border-base-border">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              placeholder="Search workshop name, email or location…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-9 py-2 bg-base-surface border border-base-border rounded-xl text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status filter pills */}
          <div className="flex bg-base-surface border border-base-border rounded-xl p-1 text-xs">
            {(["", "pending", "verified", "rejected"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-base-muted"
                }`}
              >
                {s === "" ? "All Statuses" : s}
              </button>
            ))}
          </div>

          <ActionBtn onClick={load} variant="ghost" title="Refresh employer list">
            <RefreshCw size={14} />
          </ActionBtn>
        </div>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-base-surface border border-base-border rounded-2xl animate-pulse p-4" />
          ))}
        </div>
      ) : employers.length === 0 ? (
        <div className="text-center py-14 bg-base-surface border border-base-border rounded-2xl">
          <Building2 size={36} className="mx-auto text-ink-muted mb-2 opacity-50" />
          <p className="text-sm font-bold text-ink-primary">No employer accounts match your search parameters</p>
          <p className="text-xs text-ink-muted mt-1">Try clearing filters or search queries</p>
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); }}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {employers.map((emp, idx) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              whileHover={{ y: -2 }}
              className="bg-base-surface border border-base-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-card-hover transition-all duration-200 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-ink-primary text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {emp.workshopName}
                    </h4>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      {emp.user.email}
                    </p>
                  </div>
                  {verifBadge(emp.verificationStatus)}
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-ink-muted my-3 bg-base-muted/40 p-2.5 rounded-xl border border-base-border/50">
                  <span className="font-medium text-ink-secondary">{emp.industryType}</span>
                  <span>•</span>
                  <span>{emp.location}</span>
                  <span>•</span>
                  <span>{emp.jobPostings.length} job(s) posted</span>
                  {!emp.user.isActive && (
                    <>
                      <span>•</span>
                      <span className="text-red-500 font-semibold">Account Deactivated</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-base-border mt-1">
                <span className="text-[11px] text-ink-muted">
                  Joined {new Date(emp.user.createdAt).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  {emp.verificationStatus !== "verified" && (
                    <ActionBtn
                      onClick={() => setConfirm({ id: emp.id, approve: true })}
                      variant="success"
                      size="sm"
                      loading={actioning === emp.id}
                      title="Approve employer profile"
                    >
                      <UserCheck size={13} /> Approve
                    </ActionBtn>
                  )}
                  {emp.verificationStatus !== "rejected" && (
                    <ActionBtn
                      onClick={() => setConfirm({ id: emp.id, approve: false })}
                      variant="danger"
                      size="sm"
                      loading={actioning === emp.id}
                      title="Reject employer profile"
                    >
                      <UserX size={13} /> Reject
                    </ActionBtn>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5 items-center">
          <ActionBtn onClick={() => setPage(p => Math.max(1, p - 1))} variant="ghost" size="sm">
            ← Previous
          </ActionBtn>
          <span className="text-xs font-semibold text-ink-secondary px-3 py-1 bg-base-surface border border-base-border rounded-xl">
            Page {page} of {totalPages}
          </span>
          <ActionBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} variant="ghost" size="sm">
            Next →
          </ActionBtn>
        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            title={confirm.approve ? "Approve Workshop Account" : "Reject Workshop Account"}
            message={
              confirm.approve
                ? `Approve "${employers.find(e => e.id === confirm.id)?.workshopName}"? Their job postings will become publicly visible to candidates across the portal.`
                : `Reject "${employers.find(e => e.id === confirm.id)?.workshopName}"? Their active job postings will be hidden from student candidate searches.`
            }
            confirmLabel={confirm.approve ? "Approve Account" : "Reject Account"}
            variant={confirm.approve ? "primary" : "danger"}
            onConfirm={() => handleVerify(confirm.id, confirm.approve)}
            onCancel={() => setConfirm(null)}
            loading={!!actioning}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 12 });
      setUsers(r.data.data);
      setTotalPages(r.data.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(user: AdminUser) {
    setActioning(user.id);
    setConfirmUser(null);
    try {
      await adminApi.setUserStatus(user.id, !user.isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } finally {
      setActioning(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-base-muted/30 p-3 rounded-2xl border border-base-border">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            placeholder="Search by user email or candidate name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-9 py-2 bg-base-surface border border-base-border rounded-xl text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-base-surface border border-base-border rounded-xl p-1 text-xs">
            {[
              { id: "", label: "All Roles" },
              { id: "student", label: "Candidates" },
              { id: "employer", label: "Employers" },
              { id: "admin", label: "Admins" },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => { setRoleFilter(r.id); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === r.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-base-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <ActionBtn onClick={load} variant="ghost" title="Refresh user roster">
            <RefreshCw size={14} />
          </ActionBtn>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 size={26} className="animate-spin text-blue-600 dark:text-blue-400 mx-auto" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-14 bg-base-surface border border-base-border rounded-2xl">
          <UserCog size={36} className="mx-auto text-ink-muted mb-2 opacity-50" />
          <p className="text-sm font-bold text-ink-primary">No user accounts found</p>
          <p className="text-xs text-ink-muted mt-1">Try adjusting search parameters or role filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-border bg-base-surface shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-base-muted/60 border-b border-base-border text-ink-muted font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">User Identity</th>
                <th className="px-4 py-3.5">Associated Profile</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-ink-primary">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5 text-ink-secondary">
                    {u.studentProfile?.name ?? u.employerProfile?.workshopName ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      text={u.role.toUpperCase()}
                      variant={u.role === "admin" ? "warning" : u.role === "employer" ? "info" : "primary"}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      text={u.isActive ? "● Active" : "○ Deactivated"}
                      variant={u.isActive ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {u.role !== "admin" ? (
                      <ActionBtn
                        onClick={() => setConfirmUser(u)}
                        variant={u.isActive ? "danger" : "success"}
                        size="sm"
                        loading={actioning === u.id}
                        title={u.isActive ? "Deactivate account" : "Reactivate account"}
                      >
                        {u.isActive ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                      </ActionBtn>
                    ) : (
                      <span className="text-[11px] text-ink-muted italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5 items-center">
          <ActionBtn onClick={() => setPage(p => Math.max(1, p - 1))} variant="ghost" size="sm">
            ← Previous
          </ActionBtn>
          <span className="text-xs font-semibold text-ink-secondary px-3 py-1 bg-base-surface border border-base-border rounded-xl">
            Page {page} of {totalPages}
          </span>
          <ActionBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} variant="ghost" size="sm">
            Next →
          </ActionBtn>
        </div>
      )}

      {/* Confirm deactivate modal */}
      <AnimatePresence>
        {confirmUser && (
          <ConfirmModal
            title={confirmUser.isActive ? "Deactivate User Account" : "Reactivate User Account"}
            message={
              confirmUser.isActive
                ? `Deactivate account for ${confirmUser.email}? They will be immediately signed out and cannot log in until reactivated. Candidate and workshop data are preserved.`
                : `Reactivate account for ${confirmUser.email}? They will regain full access to log in and manage their portal account.`
            }
            confirmLabel={confirmUser.isActive ? "Deactivate" : "Reactivate"}
            variant={confirmUser.isActive ? "danger" : "primary"}
            onConfirm={() => toggleStatus(confirmUser)}
            onCancel={() => setConfirmUser(null)}
            loading={!!actioning}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Jobs Panel ───────────────────────────────────────────────────────────────
function JobsPanel() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirmModerate, setConfirmModerate] = useState<AdminJob | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listJobs({
        status: statusFilter || undefined,
        flagged: flaggedOnly || undefined,
        page, limit: 12,
      });
      setJobs(r.data.data);
      setTotalPages(r.data.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, flaggedOnly, page]);

  useEffect(() => { load(); }, [load]);

  async function handleRestore(job: AdminJob) {
    setActioning(job.id);
    try {
      await adminApi.restoreJob(job.id);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, flaggedFraudulent: false, moderatedAt: null, moderationReason: null } : j));
    } finally {
      setActioning(null);
    }
  }

  async function handleModerate(jobId: string) {
    setActioning(jobId);
    try {
      await adminApi.moderateJob(jobId, "Removed by admin");
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, flaggedFraudulent: true, moderatedAt: new Date().toISOString(), moderationReason: "Removed by admin" } : j));
      setConfirmModerate(null);
    } finally {
      setActioning(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-base-muted/30 p-3 rounded-2xl border border-base-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-base-surface border border-base-border rounded-xl p-1 text-xs">
            {[
              { id: "", label: "All Postings" },
              { id: "active", label: "Active" },
              { id: "closed", label: "Closed" },
              { id: "draft", label: "Draft" },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => { setStatusFilter(s.id); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === s.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-base-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 bg-base-surface border border-base-border rounded-xl text-xs text-ink-primary font-medium cursor-pointer select-none hover:border-blue-500/40 transition-colors">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={e => { setFlaggedOnly(e.target.checked); setPage(1); }}
              className="w-3.5 h-3.5 rounded border-base-border text-blue-600 focus:ring-blue-500"
            />
            <AlertTriangle size={13} className={flaggedOnly ? "text-red-500" : "text-ink-muted"} />
            <span>Show Flagged Only</span>
          </label>
        </div>

        <ActionBtn onClick={load} variant="ghost" title="Refresh job postings">
          <RefreshCw size={14} />
        </ActionBtn>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 size={26} className="animate-spin text-blue-600 dark:text-blue-400 mx-auto" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-14 bg-base-surface border border-base-border rounded-2xl">
          <Briefcase size={36} className="mx-auto text-ink-muted mb-2 opacity-50" />
          <p className="text-sm font-bold text-ink-primary">No job postings found</p>
          <p className="text-xs text-ink-muted mt-1">Try switching filters or clearing flagged toggle</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-border bg-base-surface shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-base-muted/60 border-b border-base-border text-ink-muted font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Job Posting & Skill</th>
                <th className="px-4 py-3.5">Posting Workshop</th>
                <th className="px-4 py-3.5">Posting Status</th>
                <th className="px-4 py-3.5 text-center">Applications</th>
                <th className="px-4 py-3.5">Moderation Status</th>
                <th className="px-4 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border">
              {jobs.map(j => (
                <tr
                  key={j.id}
                  className={`transition-colors ${
                    j.flaggedFraudulent ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-blue-500/5"
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-ink-primary text-xs">{j.title}</p>
                    <p className="text-[11px] text-ink-secondary mt-0.5">
                      {j.location} • <span className="text-blue-600 dark:text-blue-400 font-medium">{j.tradeSkill.name}</span>
                    </p>
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      Posted {new Date(j.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-ink-primary">{j.employer.workshopName}</p>
                    <p className="text-[11px] text-ink-muted">{j.employer.user.email}</p>
                    <div className="mt-1">
                      <Badge
                        text={j.employer.verified ? "Verified Workshop" : "Unverified"}
                        variant={j.employer.verified ? "success" : "warning"}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge
                      text={j.status.toUpperCase()}
                      variant={j.status === "active" ? "success" : j.status === "closed" ? "muted" : "warning"}
                    />
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="font-bold text-ink-primary px-2.5 py-1 bg-base-muted rounded-lg border border-base-border">
                      {j._count.applications}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    {j.flaggedFraudulent ? (
                      <Badge text={j.moderatedAt ? "⛔ Moderated" : "⚑ Flagged"} variant="danger" />
                    ) : (
                      <Badge text="✓ Clean" variant="muted" />
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {j.moderatedAt ? (
                      <ActionBtn
                        onClick={() => handleRestore(j)}
                        variant="ghost"
                        size="sm"
                        loading={actioning === j.id}
                        title="Restore job posting to platform"
                      >
                        <RefreshCw size={13} /> Restore
                      </ActionBtn>
                    ) : (
                      <ActionBtn
                        onClick={() => setConfirmModerate(j)}
                        variant="danger"
                        size="sm"
                        title="Remove job posting from platform"
                      >
                        <Trash2 size={13} /> Moderate
                      </ActionBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5 items-center">
          <ActionBtn onClick={() => setPage(p => Math.max(1, p - 1))} variant="ghost" size="sm">
            ← Previous
          </ActionBtn>
          <span className="text-xs font-semibold text-ink-secondary px-3 py-1 bg-base-surface border border-base-border rounded-xl">
            Page {page} of {totalPages}
          </span>
          <ActionBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} variant="ghost" size="sm">
            Next →
          </ActionBtn>
        </div>
      )}

      {/* Confirm moderate modal */}
      <AnimatePresence>
        {confirmModerate && (
          <ConfirmModal
            title="Moderate & Hide Job Posting"
            message={`Remove "${confirmModerate.title}" from the platform? It will be immediately hidden from candidate job searches, while all ${confirmModerate._count.applications} existing application(s) will be safely preserved.`}
            confirmLabel="Moderate Posting"
            variant="danger"
            onConfirm={() => handleModerate(confirmModerate.id)}
            onCancel={() => setConfirmModerate(null)}
            loading={!!actioning}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "analytics",  label: "Analytics",      icon: <BarChart3 size={15} /> },
  { id: "employers",  label: "Employers",      icon: <Building2 size={15} /> },
  { id: "users",      label: "User Roster",    icon: <Users size={15} /> },
  { id: "jobs",       label: "Job Moderation", icon: <Briefcase size={15} /> },
  { id: "messages",   label: "Messages",       icon: <MessageSquare size={15} /> },
];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const initialTab: Tab = tabParam && ["analytics", "employers", "users", "jobs", "messages"].includes(tabParam)
    ? tabParam
    : "analytics";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (tabParam && ["analytics", "employers", "users", "jobs", "messages"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadAnalytics = useCallback(async () => {
    setRefreshing(true);
    setAnalyticsError(false);
    try {
      const r = await adminApi.getAnalytics();
      setAnalytics(r.data.data);
    } catch {
      setAnalyticsError(true);
    } finally {
      setAnalyticsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="min-h-screen bg-base-bg text-ink-primary selection:bg-blue-600 selection:text-white relative overflow-hidden pb-16">
      {/* Atmospheric Background Layers (Refined Blue Brand Identity) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Soft floating atmospheric ambient glows */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-[650px] h-[650px] rounded-full bg-blue-600/20 blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -left-32 w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[160px]"
        />
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-30" />
      </div>

      <div className="relative z-10">
        <AppNavbar />

        <main className="content-wrap pt-6 sm:pt-8">
          {/* ── Coordinated Page Entrance Sequence ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-surface/80 backdrop-blur-md border border-base-border p-5 sm:p-6 rounded-2xl shadow-card relative overflow-hidden"
          >
            {/* Subtle top electric accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/15 to-indigo-600/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-blue-500/10 shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-primary">
                    Admin Command Center
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    System Control
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Platform management, workshop verifications, moderation & live telemetry
                </p>
              </div>
            </div>

            {/* Header Telemetry Status Bar */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-base-muted/60 border border-base-border rounded-xl text-xs text-ink-secondary font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Platform Sync</span>
              </div>

              <button
                onClick={loadAnalytics}
                disabled={refreshing}
                className="px-4 py-2 bg-base-muted hover:bg-base-border/60 border border-base-border text-ink-primary rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-blue-600" : ""} />
                <span>Refresh Telemetry</span>
              </button>
            </div>
          </motion.div>

          {/* ── Loading Skeleton Strip ────────────────────────────────────── */}
          {analyticsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-base-surface border border-base-border rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {analyticsError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold flex items-center justify-between mb-6">
              <span className="flex items-center gap-2">
                <AlertCircle size={16} /> Failed to retrieve live telemetry data.
              </span>
              <button onClick={loadAnalytics} className="underline hover:text-red-400">Retry</button>
            </div>
          )}

          {/* ── Primary Tab Navigation Bar ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
            className="flex gap-1.5 mb-6 bg-base-surface/90 backdrop-blur-md border border-base-border rounded-2xl p-1.5 shadow-card overflow-x-auto"
          >
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              let tabBadge = null;
              if (tab.id === "employers" && analytics && analytics.totalPendingEmployers > 0) {
                tabBadge = <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-extrabold rounded-full">{analytics.totalPendingEmployers}</span>;
              } else if (tab.id === "jobs" && analytics && analytics.flaggedJobs > 0) {
                tabBadge = <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-extrabold rounded-full">{analytics.flaggedJobs}</span>;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex-1 min-w-[125px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? "text-white"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-base-muted/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-blue-600/25 shadow-md"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tabBadge}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* ── Active Tab Panel Container ──────────────────────────────── */}
          <div className="bg-base-surface border border-base-border rounded-2xl p-5 sm:p-6 shadow-card min-h-[420px] relative">
            <AnimatePresence mode="wait">
              {activeTab === "analytics" && analytics && (
                <AnalyticsPanel key="analytics" data={analytics} />
              )}
              {activeTab === "analytics" && analyticsLoading && (
                <div key="loading" className="flex items-center justify-center py-24">
                  <Loader2 size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              )}
              {activeTab === "employers" && <EmployersPanel key="employers" />}
              {activeTab === "users"     && <UsersPanel key="users" />}
              {activeTab === "jobs"      && <JobsPanel key="jobs" />}
              {activeTab === "messages"  && <AdminMessagesPanel key="messages" />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );

}
