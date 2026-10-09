import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicationDto } from '@iti-portal/shared';
import { api, messageApi } from '../lib/api';
import { motion } from 'framer-motion';
import { AppNavbar } from '../components/ui/AppNavbar';
import { PageHeader } from '../components/ui/PageHeader';
import { CertificationChip } from '../components/ui/CertificationChip';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessages';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import {
  Users, Mail, Phone, MapPin, GraduationCap, Calendar, Award,
  Loader2, ChevronDown, FileText, ExternalLink, MessageSquare, CalendarPlus
} from 'lucide-react';

export const JobApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Interview modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedCandidateName, setSelectedCandidateName] = useState('');

  useEffect(() => { fetchApplicants(); }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true); setError('');
      const res = await api.get(`/employers/me/jobs/${id}/applications`);
      if (res.data.success) setApplicants(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applicants. Please try again.');
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingId(applicationId);
      const res = await api.put(`/employers/me/jobs/${id}/applications/${applicationId}`, { status: newStatus });
      if (res.data.success) {
        setApplicants((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: res.data.data.status } : app))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update candidate status');
    } finally { setUpdatingId(null); }
  };

  const handleStartChat = async (studentId: string) => {
    if (!id || !studentId) return;
    try {
      const res = await messageApi.createConversation(id, studentId);
      if (res.data.success) {
        navigate(`/messages?conversationId=${res.data.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open chat');
    }
  };

  const openScheduleModal = (appId: string, candidateName: string) => {
    setSelectedAppId(appId);
    setSelectedCandidateName(candidateName);
    setScheduleModalOpen(true);
  };

  const filteredApplicants =
    statusFilter === 'all' ? applicants : applicants.filter((app) => app.status.toLowerCase() === statusFilter.toLowerCase());

  const filterTabs = ['all', 'applied', 'shortlisted', 'hired', 'rejected'];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      <AppNavbar />

      <main className="content-wrap pt-8">
        <PageHeader
          title="Candidate Review Board"
          subtitle={`Reviewing ${applicants.length} candidate${applicants.length === 1 ? '' : 's'} who applied for this opening`}
          onBack={() => navigate('/employer/dashboard')}
          backLabel="Back to Employer Dashboard"
          badge={
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              {applicants.length} Total
            </span>
          }
        />

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filterTabs.map((tab) => {
            const count = tab === 'all' ? applicants.length : applicants.filter((a) => a.status.toLowerCase() === tab).length;
            const isSelected = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected 
                    ? "bg-blue-600 text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingState message="Loading candidate applications and verified certifications..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchApplicants} />
        ) : filteredApplicants.length === 0 ? (
          <EmptyState
            message="No candidates found in this view"
            description="When ITI trainees apply for this job posting, their profiles, trade skills, and verified certificates will appear here."
            icon={<Users size={26} />}
          />
        ) : (
          <div className="grid gap-5">
            {filteredApplicants.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.2), duration: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 hover:shadow-md transition-all flex flex-col justify-between gap-6"
              >
                {/* Candidate header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold shrink-0 bg-blue-50 border border-blue-100 text-blue-700"
                    >
                      {app.student?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                          {app.student?.name || 'Candidate'}
                        </h3>
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" />{app.student?.user?.email}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" />{app.student?.phone || 'No phone provided'}</span>
                        <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={12} />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {app.student?.resumeUrl && (
                      <a
                        href={app.student.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={13} />
                        <span>Candidate Resume</span>
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {/* Direct Messaging button */}
                    <button
                      type="button"
                      onClick={() => handleStartChat(app.studentId)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>Chat with Candidate</span>
                    </button>

                    {/* Schedule Interview button */}
                    <button
                      type="button"
                      onClick={() => openScheduleModal(app.id, app.student?.name || 'Candidate')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <CalendarPlus size={13} />
                      <span>Schedule Interview</span>
                    </button>

                    <div className="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2.5 bg-gray-50 border border-gray-200">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status:</label>
                      <div className="relative min-w-[170px]">
                        <select
                          className="w-full bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none pr-8 text-xs font-semibold cursor-pointer py-1.5 pl-3 text-gray-900"
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          disabled={updatingId === app.id}
                        >
                          <option value="applied">Applied (New)</option>
                          <option value="viewed">Viewed (Reviewed)</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired / Accepted</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          {updatingId === app.id ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <ChevronDown size={12} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl text-xs bg-gray-50 border border-gray-200">
                  {[
                    { icon: <GraduationCap size={14} className="text-blue-600" />, label: 'Institute', value: app.student?.itiInstitute || 'Not specified' },
                    { icon: <MapPin size={14} className="text-blue-600" />, label: 'Location', value: app.student?.location || 'Not specified' },
                    { icon: <Award size={14} className="text-blue-500" />, label: 'Certificates', value: `${app.student?.certifications?.length || 0} Document${(app.student?.certifications?.length || 0) === 1 ? '' : 's'}` },
                  ].map((meta) => (
                    <div key={meta.label} className="flex items-center gap-2">
                      {meta.icon}
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-semibold">{meta.label}</span>
                        <span className="font-semibold text-gray-900 truncate block">{meta.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                {app.student?.certifications && app.student.certifications.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Award size={13} className="text-blue-600" />
                      Verified Trade Credentials
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {app.student.certifications.map((cert) => (
                        <CertificationChip
                          key={cert.id}
                          title={cert.title}
                          url={cert.proofUrl}
                          status={cert.verificationStatus}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        applicationId={selectedAppId}
        candidateName={selectedCandidateName}
        onScheduled={fetchApplicants}
      />
    </div>
  );
};
