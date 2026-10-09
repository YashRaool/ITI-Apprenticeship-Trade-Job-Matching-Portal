import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { employerApi } from "../lib/api";
import { EmployerProfileDto, JobPostingDto } from "@iti-portal/shared";
import EmployerProfileForm from "../components/EmployerProfileForm";
import JobPostingForm from "../components/JobPostingForm";
import { UpcomingInterviewsSection } from "../components/UpcomingInterviewsSection";
import { AppNavbar } from "../components/ui/AppNavbar";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { LoadingState, EmptyState } from "../components/ui/StateMessages";
import {
  Edit2, Plus, MapPin, Briefcase, Building2,
  CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp, Users, Power, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type View = "dashboard" | "editProfile" | "newJob" | "editJob";

function JobRow({
  job, onEdit, onDelete, onToggleStatus,
}: {
  job: JobPostingDto;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="bg-white border-b border-gray-100 last:border-b-0 overflow-hidden transition-all hover:bg-gray-50"
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base truncate">{job.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              job.jobType === "full_time"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {job.jobType === "full_time" ? "Full-Time" : "Apprenticeship"}
            </span>
            <StatusBadge status={job.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />{job.location}
            </span>
            {job.tradeSkill && (
              <span className="flex items-center gap-1 font-medium text-blue-600">
                <Briefcase size={12} />{(job.tradeSkill as any).name}
              </span>
            )}
            <span className="text-gray-400">Created {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 sm:pt-0">
          <button type="button" onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold py-2 px-3.5 transition-colors">
            <Users size={13} /><span>Applicants</span>
          </button>

          <button
            type="button"
            onClick={onToggleStatus}
            className={`text-xs px-3 py-2 rounded-lg border font-semibold transition-colors inline-flex items-center gap-1.5 ${
              job.status === "active" 
                ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" 
                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            }`}
          >
            <Power size={12} />
            <span>{job.status === "active" ? "Close" : "Reopen"}</span>
          </button>

          <button type="button" onClick={onEdit} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors" title="Edit">
            <Edit2 size={13} />
          </button>

          <button type="button" onClick={onDelete} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>

          <button type="button" onClick={() => setExpanded((p) => !p)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-4 whitespace-pre-wrap overflow-hidden bg-gray-50"
          >
            <p className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Job Description Preview</p>
            {job.description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EmployerDashboard() {
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get("action");

  const [profile, setProfile] = useState<EmployerProfileDto | null>(null);
  const [jobs, setJobs] = useState<JobPostingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(actionParam === "new-job" ? "newJob" : "dashboard");
  const [editingJob, setEditingJob] = useState<JobPostingDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionParam === "new-job") {
      setView("newJob");
    }
  }, [actionParam]);

  const fetchAll = async () => {
    try {
      const [profRes, jobsRes] = await Promise.all([
        employerApi.getProfile().catch(() => null),
        employerApi.getJobs().catch(() => ({ data: { data: [] } })),
      ]);
      if (profRes?.data?.data) setProfile(profRes.data.data);
      if (jobsRes?.data?.data) setJobs(jobsRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const calcCompletion = () => {
    if (!profile) return 0;
    let s = 0;
    if (profile.workshopName) s += 34;
    if (profile.industryType) s += 33;
    if (profile.location) s += 33;
    return s;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await employerApi.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Cannot delete job with applications. Please close it instead.");
      } else {
        alert("Failed to delete job posting");
      }
    }
  };

  const handleToggleStatus = async (job: JobPostingDto) => {
    try {
      const updated = await employerApi.updateJob(job.id, {
        title: job.title,
        tradeSkillId: job.tradeSkillId,
        location: job.location,
        description: job.description,
        jobType: job.jobType,
        status: job.status === "active" ? "closed" : "active",
      });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated.data.data : j)));
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavbar />
        <LoadingState message="Loading employer operations center..." />
      </div>
    );
  }

  const completion = calcCompletion();
  const openCount = jobs.filter((j) => j.status === "active").length;

  if (view === "editProfile") {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
        <AppNavbar />
        <div className="content-wrap max-w-3xl pt-8">
          <PageHeader
            title={profile ? "Edit Company Profile" : "Setup Company Profile"}
            subtitle="Update workshop legal information and operational city"
            onBack={() => setView("dashboard")}
            backLabel="Back to Operations"
          />
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <EmployerProfileForm
              initialData={profile}
              onSave={() => { fetchAll(); setView("dashboard"); }}
              onCancel={() => setView("dashboard")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (view === "newJob" || view === "editJob") {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
        <AppNavbar />
        <div className="content-wrap max-w-3xl pt-8">
          <PageHeader
            title={view === "editJob" ? "Edit Apprenticeship Posting" : "Publish Trade Apprenticeship"}
            subtitle="Recruit verified ITI candidates matching trade standards"
            onBack={() => { setView("dashboard"); setEditingJob(null); }}
            backLabel="Back to Operations"
          />
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <JobPostingForm
              initialData={editingJob}
              onSave={() => { fetchAll(); setView("dashboard"); setEditingJob(null); }}
              onCancel={() => { setView("dashboard"); setEditingJob(null); }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      <AppNavbar />

      <main className="content-wrap pt-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <PageHeader
            title="Employer Operations Hub"
            subtitle={profile?.workshopName || "Manage apprenticeship postings and review certified trade applicants"}
            rightContent={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4 transition-colors"
                >
                  <MessageSquare size={15} /><span>Messages & Chat</span>
                </button>
                <button type="button" onClick={() => setView("newJob")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4 transition-colors">
                  <Plus size={15} /><span>Post Apprenticeship</span>
                </button>
              </div>
            }
          />
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Postings', value: jobs.length, icon: <Briefcase size={16} />,
              iconBg: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-gray-900',
            },
            {
              label: 'Active Openings', value: openCount, icon: <Power size={16} />,
              iconBg: 'bg-green-50', iconColor: 'text-green-600', valueColor: 'text-gray-900',
            },
            {
              label: 'Profile Completion', value: `${completion}%`, icon: <CheckCircle2 size={16} />,
              iconBg: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-gray-900',
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.05, duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconBg} ${kpi.iconColor}`}>
                  {kpi.icon}
                </div>
              </div>
              <p className={`text-3xl font-extrabold ${kpi.valueColor}`}>{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">
                {kpi.label === 'Profile Completion'
                  ? (profile?.verified ? "Verified Industry Partner" : "Verification in review")
                  : kpi.label === 'Active Openings'
                    ? "Receiving applications now"
                    : "All career opportunities"}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Interviews Section */}
        <UpcomingInterviewsSection userRole="employer" />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workshop Profile */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.22 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={15} className="text-blue-600" />
                Workshop Profile
              </h2>
              <button type="button" onClick={() => setView("editProfile")} className="inline-flex items-center gap-1 text-xs font-semibold hover:underline text-blue-600">
                <Edit2 size={11} /> Edit
              </button>
            </div>

            {profile ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Workshop Name</span>
                  <p className="font-bold text-gray-900 text-base">{profile.workshopName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Industry Sector</span>
                  <p className="font-medium text-gray-600">{profile.industryType}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Operational City</span>
                  <p className="font-medium text-gray-600 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={12} className="text-blue-600" />{profile.location}
                  </p>
                </div>
                {profile.contactPhone && (
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Contact Phone</span>
                    <p className="font-medium text-gray-800">{profile.contactPhone}</p>
                  </div>
                )}
                {profile.description && (
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Facility Overview</span>
                    <p className="font-medium text-gray-600 line-clamp-3 text-xs leading-relaxed">{profile.description}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  {profile.verified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 size={12} /> Verified Employer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
                      <Clock size={12} /> Verification Pending
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-3">Company profile not completed yet.</p>
                <button type="button" onClick={() => setView("editProfile")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs py-2 px-4 transition-colors">Setup Profile</button>
              </div>
            )}
          </motion.div>

          {/* Jobs list */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.22 }}
            className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-5 sm:p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                  <Briefcase size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Active Job Postings</h2>
                  <p className="text-xs text-gray-500">Monitor applicants and posting statuses</p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white">
              {jobs.length === 0 ? (
                <div className="p-5 sm:p-6">
                  <EmptyState
                    message="No job postings yet"
                    description="Publish your first apprenticeship opportunity to start receiving applications from verified ITI candidates."
                    icon={<Briefcase size={26} />}
                    action={
                      <button type="button" onClick={() => setView("newJob")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-4 transition-colors mt-2">
                        <Plus size={13} /><span>Publish First Opportunity</span>
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {jobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.05, 0.2) }}
                      >
                        <JobRow
                          job={job}
                          onEdit={() => { setEditingJob(job); setView("editJob"); }}
                          onDelete={() => handleDelete(job.id)}
                          onToggleStatus={() => handleToggleStatus(job)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
