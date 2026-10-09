import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { studentApi, employerApi } from "../lib/api";
import { StudentProfileDto, EmployerProfileDto } from "@iti-portal/shared";
import { AppNavbar } from "../components/ui/AppNavbar";
import { LoadingState } from "../components/ui/StateMessages";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  PlusCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  Award,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState<StudentProfileDto | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        if (user?.role === "student") {
          const res = await studentApi.getProfile().catch(() => null);
          if (isMounted && res?.data?.data) {
            setStudentProfile(res.data.data);
          }
        } else if (user?.role === "employer") {
          const res = await employerApi.getProfile().catch(() => null);
          if (isMounted && res?.data?.data) {
            setEmployerProfile(res.data.data);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavbar />
        <LoadingState message="Loading your account profile..." />
      </div>
    );
  }

  const getDashboardPath = () => {
    if (user?.role === "employer") return "/employer/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const displayName =
    (user?.role === "student" && studentProfile?.name) ||
    (user?.role === "employer" && employerProfile?.workshopName) ||
    (user?.role === "admin" && "System Administrator") ||
    (user?.email ? user.email.split("@")[0] : null) ||
    (user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} User` : "User");

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || "U";

  // Role-specific primary actions for the Command Center
  const getActionCards = () => {
    if (user?.role === "student") {
      return [
        {
          title: "Find Apprenticeships",
          description: "Search and apply to verified industrial trade openings",
          path: "/jobs",
          icon: <Search size={22} className="text-blue-600" />,
          accent: "hover:border-blue-400 bg-blue-50/50",
          btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
        },
        {
          title: "My Applications",
          description: "Track live status and updates from applied workshops",
          path: "/student/dashboard",
          icon: <Briefcase size={22} className="text-indigo-600" />,
          accent: "hover:border-indigo-400 bg-indigo-50/50",
          btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
        },
        {
          title: "My Dashboard",
          description: "Manage your trade resume, institute, and verified documents",
          path: "/student/dashboard",
          icon: <LayoutDashboard size={22} className="text-slate-700" />,
          accent: "hover:border-slate-400 bg-slate-50",
          btnColor: "bg-slate-800 hover:bg-slate-900 text-white",
        },
      ];
    }

    if (user?.role === "employer") {
      return [
        {
          title: "Post a Job",
          description: "Create a new apprenticeship or industrial technician vacancy",
          path: "/employer/dashboard?action=new-job",
          icon: <PlusCircle size={22} className="text-emerald-600" />,
          accent: "hover:border-emerald-400 bg-emerald-50/50",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
        },
        {
          title: "Manage Jobs",
          description: "View active postings, applicants, and candidate shortlists",
          path: "/employer/dashboard",
          icon: <Briefcase size={22} className="text-blue-600" />,
          accent: "hover:border-blue-400 bg-blue-50/50",
          btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
        },
        {
          title: "Employer Dashboard",
          description: "Access your workshop profile, hiring pipeline, and settings",
          path: "/employer/dashboard",
          icon: <LayoutDashboard size={22} className="text-slate-700" />,
          accent: "hover:border-slate-400 bg-slate-50",
          btnColor: "bg-slate-800 hover:bg-slate-900 text-white",
        },
      ];
    }

    // Admin role
    return [
      {
        title: "Admin Dashboard",
        description: "Full portal control center, moderation tools, and system health",
        path: "/admin/dashboard",
        icon: <LayoutDashboard size={22} className="text-purple-600" />,
        accent: "hover:border-purple-400 bg-purple-50/50",
        btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
      },
      {
        title: "Employer Approvals",
        description: "Review and approve employer registrations and workshop credentials",
        path: "/admin/dashboard?tab=employers",
        icon: <ShieldCheck size={22} className="text-emerald-600" />,
        accent: "hover:border-emerald-400 bg-emerald-50/50",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      },
      {
        title: "User Accounts",
        description: "Oversee candidate and recruiter accounts across all trades",
        path: "/admin/dashboard?tab=users",
        icon: <Users size={22} className="text-blue-600" />,
        accent: "hover:border-blue-400 bg-blue-50/50",
        btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      },
      {
        title: "Platform Analytics",
        description: "View real-time metrics, application rates, and trade demand",
        path: "/admin/dashboard?tab=analytics",
        icon: <BarChart3 size={22} className="text-amber-600" />,
        accent: "hover:border-amber-400 bg-amber-50/50",
        btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
      },
    ];
  };

  const actionCards = getActionCards();

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Top Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-xs text-gray-400">Personal Command Center</span>
        </div>

        {/* 1. Header Profile Hero */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md select-none shrink-0 tracking-wider">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">
                    {displayName}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      user?.role === "admin"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : user?.role === "employer"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {user?.role === "admin"
                      ? "Administrator"
                      : user?.role === "employer"
                      ? "Employer"
                      : "ITI Trainee"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  {user?.email || `${user?.role} account`}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => navigate(getDashboardPath())}
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. Clear Action Cards: The Personal Command Center */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Quick Actions
          </h2>
          <div className={`grid grid-cols-1 ${actionCards.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3.5`}>
            {actionCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.18 }}
                onClick={() => navigate(card.path)}
                className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group ${card.accent}`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Open</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Account Information Details */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.18 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <span>Saved Profile Details</span>
            </h2>
            <Link
              to={getDashboardPath()}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Edit Details</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {user?.role === "student" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{studentProfile?.name || "Not provided"}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" />
                    {studentProfile?.phone || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ITI Institute</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-gray-400" />
                    {studentProfile?.itiInstitute || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    {studentProfile?.location || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Vocational Resume / CV</p>
                  <div className="text-sm font-medium text-gray-900 mt-0.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-gray-400" />
                      {studentProfile?.resumeUrl ? "Document Attached" : "No resume uploaded"}
                    </span>
                    {studentProfile?.resumeUrl && (
                      <a href={studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                        <span>View Document</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {studentProfile?.tradeSkillsDetails && studentProfile.tradeSkillsDetails.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award size={13} className="text-blue-600" />
                    <span>Certified Trade Skills</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentProfile.tradeSkillsDetails.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {user?.role === "employer" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Workshop / Enterprise</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-gray-400" />
                  {employerProfile?.workshopName || "Not configured"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Industry Sector</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-gray-400" />
                  {employerProfile?.industryType || "Not configured"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {employerProfile?.location || "Not configured"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Phone</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  {employerProfile?.contactPhone || "Not provided"}
                </p>
              </div>
              {employerProfile?.description && (
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Facility Description</p>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{employerProfile.description}</p>
                </div>
              )}
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Verification Status</p>
                <p className="text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                  {employerProfile?.verified ? (
                    <span className="text-green-600 inline-flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified Employer
                    </span>
                  ) : (
                    <span className="text-amber-600 inline-flex items-center gap-1">
                      <Clock size={13} /> Verification Pending
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {user?.role === "admin" && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                <ShieldCheck size={15} />
                <span>Full System Administration</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Authorized administrator session. Manage employer approvals, candidate profiles, and platform telemetry directly from the command cards above.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
