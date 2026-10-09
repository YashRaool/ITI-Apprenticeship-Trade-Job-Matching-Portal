import React, { useState, useEffect } from "react";
import { InterviewDto } from "@iti-portal/shared";
import { interviewApi } from "../lib/api";
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface UpcomingInterviewsSectionProps {
  userRole: "student" | "employer";
}

export const UpcomingInterviewsSection: React.FC<UpcomingInterviewsSectionProps> = ({ userRole }) => {
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await interviewApi.getMyInterviews();
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "SCHEDULED" | "CANCELLED" | "COMPLETED") => {
    try {
      const res = await interviewApi.updateInterviewStatus(id, newStatus);
      if (res.data.success) {
        setInterviews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: res.data.data.status } : item))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update interview status");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-100 rounded-xl w-1/4"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span>Upcoming Interviews</span>
        </h3>
        <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-50 text-blue-600 border border-blue-200">
          {interviews.length} Scheduled
        </span>
      </div>

      {error && (
        <div className="p-3.5 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={15} /> {error}</span>
          <button onClick={fetchInterviews} className="underline font-bold flex items-center gap-1">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-gray-700">No interviews scheduled yet</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
            {userRole === "employer"
              ? "You can schedule interviews with shortlisted candidates directly from your job applicant dashboard."
              : "When an employer schedules an interview for your job application, details will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item, idx) => {
            const formattedDate = new Date(item.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const isCompleted = item.status === "COMPLETED";
            const isCancelled = item.status === "CANCELLED";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>

                    {/* Mode badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.mode === "ONLINE"
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {item.mode === "ONLINE" ? <Video className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-amber-500" />}
                      {item.mode === "ONLINE" ? "Online / Video" : "In-Person Workshop"}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isCancelled
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 font-medium">
                    {userRole === "student" ? (
                      <>Workshop: <span className="font-bold text-gray-900">{item.employer?.workshopName || "Employer"}</span></>
                    ) : (
                      <>Candidate: <span className="font-bold text-gray-900">{item.student?.name || "Applicant"}</span></>
                    )}
                    {item.application?.job?.title && (
                      <span className="text-gray-500 font-normal"> ({item.application.job.title})</span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {item.time}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 mt-1 italic leading-relaxed">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Status action buttons (Employer only) */}
                {userRole === "employer" && !isCompleted && !isCancelled && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStatusChange(item.id, "COMPLETED")}
                      className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, "CANCELLED")}
                      className="px-3 py-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
