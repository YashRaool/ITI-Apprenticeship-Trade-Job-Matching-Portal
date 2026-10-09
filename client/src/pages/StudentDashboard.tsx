import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { studentApi } from "../lib/api";
import { StudentProfileDto, CertificationDto } from "@iti-portal/shared";
import StudentProfileForm from "../components/StudentProfileForm";
import CertificationUpload from "../components/CertificationUpload";
import ResumeUpload from "../components/ResumeUpload";
import { UpcomingInterviewsSection } from "../components/UpcomingInterviewsSection";
import { AppNavbar } from "../components/ui/AppNavbar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { LoadingState, EmptyState } from "../components/ui/StateMessages";
import {
  Edit2, MapPin, Phone, GraduationCap, Trash2, CheckCircle2, Clock, XCircle,
  ExternalLink, Search, Sparkles, ChevronRight, Award, Briefcase, FileCheck, FileText, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [certifications, setCertifications] = useState<CertificationDto[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [profRes, certRes, appRes, recRes] = await Promise.all([
        studentApi.getProfile().catch(() => null),
        studentApi.getCertifications().catch(() => ({ data: { data: [] } })),
        studentApi.getApplications().catch(() => ({ data: { data: [] } })),
        studentApi.getRecommendedJobs().catch(() => ({ data: { data: [] } })),
      ]);
      if (profRes?.data?.data) setProfile(profRes.data.data);
      if (certRes?.data?.data) setCertifications(certRes.data.data);
      if (appRes?.data?.data) setApplications(appRes.data.data);
      if (recRes?.data?.data) setRecommendedJobs(recRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 20;
    if (profile.phone) score += 20;
    if (profile.location) score += 20;
    if (profile.tradeSkills && profile.tradeSkills.length > 0) score += 20;
    if (profile.resumeUrl) score += 20;
    return score;
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Are you sure you want to remove this certificate?")) return;
    try {
      await studentApi.deleteCertification(id);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete certification. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavbar />
        <LoadingState message="Loading your career momentum dashboard..." />
      </div>
    );
  }

  const completion = calculateCompletion();
  const isComplete = completion === 100;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      <AppNavbar />

      <main className="content-wrap pt-8 px-4 max-w-7xl mx-auto">
        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-50 border border-blue-200 text-blue-700">
                <Sparkles size={12} className="text-blue-500" />
                <span>ITI Trainee Career Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, {profile?.name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                Track your apprenticeship applications, verified trade credentials, and discover active industrial openings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4 rounded-lg font-semibold transition-colors"
              >
                <MessageSquare size={15} />
                <span>Messages & Chat</span>
              </button>
              <button type="button" onClick={() => navigate("/jobs")} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4 rounded-lg font-semibold transition-colors">
                <Search size={15} />
                <span>Explore Apprenticeships</span>
              </button>
            </div>
          </div>

          {/* Profile completion */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-600 flex items-center gap-1.5">
                <Award size={13} className="text-blue-600" />
                Profile Completion
              </span>
              <span className={isComplete ? "text-green-600" : "text-blue-600"}>
                {completion}% Complete
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${isComplete ? 'bg-green-600' : 'bg-blue-600'}`}
              />
            </div>
            {!isComplete && (
              <p className="text-xs text-gray-500 mt-2.5 flex items-center gap-2">
                <span>⚠️ Add your full contact info and at least one trade skill to qualify for direct matching.</span>
                <button type="button" onClick={() => setEditingProfile(true)} className="font-semibold text-blue-600 hover:underline cursor-pointer">
                  Complete Now →
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile + Applications + Recommended */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.22 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                    <GraduationCap size={17} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Personal &amp; Trade Details</h2>
                </div>
                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() => setEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={12} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {editingProfile ? (
                    <StudentProfileForm
                      key="edit"
                      initialData={profile || undefined}
                      onSave={() => { setEditingProfile(false); fetchDashboardData(); }}
                      onCancel={() => setEditingProfile(false)}
                    />
                  ) : (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                      {profile ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: 'Full Candidate Name', value: profile.name, icon: null },
                              { label: 'Contact Phone', value: profile.phone || '—', icon: <Phone size={13} className="text-blue-500" /> },
                              { label: 'ITI Institute', value: profile.itiInstitute || '—', icon: <GraduationCap size={13} className="text-blue-500" /> },
                              { label: 'Preferred Location', value: profile.location || '—', icon: <MapPin size={13} className="text-blue-500" /> },
                              {
                                label: 'Vocational Resume / CV',
                                value: profile.resumeUrl ? (
                                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold">
                                    <span>Attached CV</span>
                                    <ExternalLink size={12} />
                                  </a>
                                ) : 'Not uploaded yet',
                                icon: <FileText size={13} className="text-blue-500" />
                              },
                            ].map((field) => (
                              <div key={field.label} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{field.label}</p>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {field.icon}{field.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">Certified Trade Specializations</p>
                            {profile.tradeSkillsDetails?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {profile.tradeSkillsDetails.map((s: any) => (
                                  <span
                                    key={s.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No trade skills selected yet. Click Edit Profile to choose your trades.</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-600 mb-4">You haven't set up your candidate profile yet. Complete it to unlock applications.</p>
                          <button type="button" onClick={() => setEditingProfile(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 px-4 rounded-lg font-semibold transition-colors">
                            Set Up Candidate Profile
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Upcoming Interviews Section */}
            <UpcomingInterviewsSection userRole="student" />

            {/* Applications */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.22 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                    <Briefcase size={17} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">My Applications</h2>
                    <p className="text-xs text-gray-500">Real-time status from prospective workshops</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {applications.length} Submitted
                </span>
              </div>

              <div>
                {applications.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      message="No active job applications"
                      description="Browse available trade apprenticeship openings and submit applications directly."
                      icon={<Briefcase size={26} className="text-gray-400" />}
                      action={
                        <button type="button" onClick={() => navigate("/jobs")} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm py-2 px-4 rounded-lg font-semibold transition-colors">
                          Search Openings
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {applications.map((app, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.2), duration: 0.2 }}
                        onClick={() => navigate(`/jobs/${app.jobId}`)}
                        className={`p-5 bg-white hover:bg-gray-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                          i !== applications.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{app.job?.title}</h3>
                            <ChevronRight size={13} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{app.job?.employer?.workshopName} • {app.job?.location}</p>
                          <p className="text-[11px] text-gray-500 mt-1">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={app.status} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recommended Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.22 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Recommended Opportunities</h2>
                    <p className="text-xs text-gray-500">Matched with your certified trade skill profile</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {recommendedJobs.length === 0 ? (
                  <EmptyState
                    message="No current recommendations"
                    description="Select trade specializations in your profile to receive automatic tailored job recommendations."
                    icon={<Sparkles size={26} className="text-gray-400" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedJobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.2), duration: 0.2 }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                              {job.tradeSkill?.name}
                            </span>
                            <span className="text-xs font-medium text-green-600">Active</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{job.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{job.employer?.workshopName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1"><MapPin size={11} />{job.location}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                          <span>View Details</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Resume + Certification Upload + Vault */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.22 }}>
              <ResumeUpload currentResumeUrl={profile?.resumeUrl} onSuccess={fetchDashboardData} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.22 }}>
              <CertificationUpload onSuccess={fetchDashboardData} />
            </motion.div>

            {/* Document Vault */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.10, duration: 0.22 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck size={16} className="text-blue-600" />
                  Trade Document Vault
                </h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-200">
                  {certifications.length}
                </span>
              </div>

              <div>
                {certifications.length === 0 ? (
                  <div className="p-5">
                    <p className="text-xs text-gray-500 text-center py-6">No verified trade certificates uploaded yet. Use the upload box above to add your papers.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {certifications.map((cert, i) => (
                      <div 
                        key={cert.id} 
                        className={`bg-white p-4 flex flex-col gap-2.5 hover:bg-gray-50 transition-colors ${
                          i !== certifications.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-gray-900 leading-tight">{cert.title}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCert(cert.id)}
                            className="text-gray-400 p-1 rounded transition-colors hover:text-red-600 hover:bg-red-50"
                            title="Delete Certificate"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50 text-xs">
                          <a href={cert.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[11px] text-blue-600 hover:underline">
                            <ExternalLink size={11} />
                            <span>Inspect Doc</span>
                          </a>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                            {cert.verificationStatus === "verified" && (
                              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={11} /> Verified</span>
                            )}
                            {cert.verificationStatus === "pending" && (
                              <span className="flex items-center gap-1 text-orange-500"><Clock size={11} /> Review Pending</span>
                            )}
                            {cert.verificationStatus === "rejected" && (
                              <span className="flex items-center gap-1 text-red-600"><XCircle size={11} /> Rejected</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
