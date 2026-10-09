import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPostingDto, ApplicationDto } from '@iti-portal/shared';
import { useAuth } from '../context/AuthContext';
import { api, messageApi } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AppNavbar } from '../components/ui/AppNavbar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/StateMessages';
import {
  ArrowLeft, MapPin, Building2, Briefcase, Calendar, CheckCircle2,
  AlertCircle, ShieldCheck, Loader2, MessageSquare
} from 'lucide-react';

// ... inside component handleStartChat:
//   const handleStartChat = async () => {
//     if (!id) return;
//     try {
//       const res = await messageApi.createConversation(id);
//       if (res.data.success) {
//         navigate(`/messages?conversationId=${res.data.data.id}`);
//       }
//     } catch (err: any) {
//       alert(err.response?.data?.message || 'Failed to open message conversation');
//     }
//   };

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<JobPostingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [applying, setApplying] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
    if (user?.role === 'student') fetchMyApplications();
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) setJob(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/students/me/applications');
      if (res.data.success) setApplications(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { alert('Only registered ITI candidates can apply to job openings.'); return; }
    setApplying(true); setActionNotice(null);
    try {
      await api.post('/students/me/applications', { jobPostingId: id });
      await fetchMyApplications();
      setActionNotice('Application submitted successfully to employer!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally { setApplying(false); }
  };

  const handleStartChat = async () => {
    if (!id) return;
    try {
      const res = await messageApi.createConversation(id);
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open message conversation');
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    setApplying(true); setActionNotice(null);
    try {
      await api.delete(`/students/me/applications/${applicationId}`);
      await fetchMyApplications();
      setActionNotice('Application withdrawn.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavbar />
        <LoadingState message="Loading apprenticeship details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <AppNavbar />
        <div className="max-w-3xl mx-auto px-4 pt-12">
          <div className="p-6 rounded-2xl text-center bg-red-50 border border-red-200">
            <AlertCircle size={34} className="mx-auto mb-2 text-red-600" />
            <h3 className="text-base font-bold mb-1 text-red-800">Opportunity Not Found</h3>
            <p className="text-xs text-red-600 mb-4">{error || 'This job posting may have been removed.'}</p>
            <button type="button" onClick={() => navigate('/jobs')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs py-2 px-4 transition-colors">Back to Apprenticeships</button>
          </div>
        </div>
      </div>
    );
  }

  const existingApp = applications.find((app) => app.jobId === id);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back */}
        <motion.button
          type="button"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-blue-600 mb-6 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Openings</span>
        </motion.button>

        {/* Action notice */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700"
            >
              <CheckCircle2 size={17} />
              <span>{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"
                >
                  <Briefcase size={12} />{job.tradeSkill?.name || 'Trade Requirement'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  job.jobType === 'full_time'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {job.jobType === 'full_time' ? 'Full-Time Trade Job' : 'Apprenticeship Opening'}
                </span>
              </div>
              <StatusBadge status={job.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1.5 font-medium text-gray-800">
                <Building2 size={15} className="text-blue-600" />
                <span>{(job as any).employer?.workshopName || 'Certified Workshop'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-gray-400" /><span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar size={15} /><span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Qualification banner */}
            <div className="p-4 sm:p-5 rounded-xl flex items-start gap-4 bg-blue-50 border border-blue-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">NCVT / SCVT Alignment Required</h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Applicants must have completed formal ITI trade training or have equivalent certified documentation in{' '}
                  <strong className="text-blue-700">{job.tradeSkill?.name}</strong>.
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Job Description &amp; Scope of Work
              </h3>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap p-5 rounded-xl bg-gray-50 border border-gray-200">
                {job.description}
              </div>
            </div>

            {/* Workshop Overview if present */}
            {(job as any).employer?.description && (
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                  About the Workshop / Plant
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed p-4 rounded-xl bg-slate-50 border border-gray-200">
                  {(job as any).employer.description}
                </div>
              </div>
            )}

            {/* Application footer */}
            <div className="pt-6 border-t border-gray-200">
              {existingApp ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={existingApp.status} />
                    <span className="text-xs text-gray-500">Applied on {new Date(existingApp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartChat}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs py-2 px-4 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare size={13} />
                      <span>Message Workshop</span>
                    </button>
                    {existingApp.status === 'applied' && (
                      <button type="button" onClick={() => handleWithdraw(existingApp.id)} disabled={applying} className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 rounded-lg text-xs py-2 px-4 transition-colors flex items-center gap-2">
                        {applying ? <Loader2 size={13} className="animate-spin" /> : null}
                        <span>Withdraw Application</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <p className="text-xs text-gray-500">
                    {job.status === 'active'
                      ? 'Applications are currently being reviewed by workshop hiring managers.'
                      : 'This position is closed to new applicants.'}
                  </p>
                  {job.status === 'active' ? (
                    <button type="button" onClick={handleApply} disabled={applying} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 text-sm shadow-md rounded-lg flex items-center justify-center gap-2 transition-colors">
                      {applying ? (
                        <><Loader2 size={15} className="animate-spin" /><span>Submitting…</span></>
                      ) : (
                        <span>{job.jobType === 'full_time' ? 'Apply for Trade Job' : 'Apply for Apprenticeship'}</span>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                      Position Closed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
