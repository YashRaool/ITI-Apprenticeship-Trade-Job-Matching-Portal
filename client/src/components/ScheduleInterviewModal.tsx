import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Video, MapPin, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { interviewApi } from "../lib/api";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  onScheduled?: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  onScheduled,
}) => {
  const [title, setTitle] = useState(`Technical Interview with ${candidateName}`);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Set default minimum date to today
  const minDate = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date for the interview.");
      return;
    }
    if (!title.trim()) {
      setError("Interview title is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await interviewApi.scheduleInterview({
        applicationId,
        title: title.trim(),
        date,
        time,
        mode,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      if (onScheduled) onScheduled();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative"
        >
          {/* Top gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Schedule Interview
                </h3>
                <p className="text-xs text-slate-500">Candidate: <span className="font-semibold text-slate-800">{candidateName}</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {success ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 flex items-center justify-center mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Interview Scheduled!</h4>
              <p className="text-xs text-slate-500 mt-1">An invitation has been created for {candidateName}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Interview Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Technical Round 1"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM / 2:00 PM"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Interview Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("ONLINE")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      mode === "ONLINE"
                        ? "bg-blue-50 border-blue-600 text-blue-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-500" />
                    Online / Video
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("IN_PERSON")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      mode === "IN_PERSON"
                        ? "bg-amber-50 border-amber-600 text-amber-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-500" />
                    In-Person Workshop
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide meeting link, location address, or preparation notes..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-blue-600/20 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  Schedule Interview
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
