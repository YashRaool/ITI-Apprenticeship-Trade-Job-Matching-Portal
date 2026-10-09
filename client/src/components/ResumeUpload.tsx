import React, { useState, useRef } from "react";
import { studentApi } from "../lib/api";
import { FileText, UploadCloud, CheckCircle2, Trash2, ExternalLink, Loader2, RefreshCw } from "lucide-react";

interface Props {
  currentResumeUrl?: string | null;
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUpload({ currentResumeUrl, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 5MB size limit. Please upload a smaller document.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Only PDF and Word documents (.doc, .docx) are accepted.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      await studentApi.uploadResume(file);
      setSuccessMsg("Resume uploaded successfully!");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume? Employers will no longer see it.")) return;
    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    try {
      await studentApi.deleteResume();
      setSuccessMsg("Resume removed.");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete resume.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          Vocational Resume / CV
        </h3>
        {currentResumeUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <CheckCircle2 size={11} /> Active
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 text-xs p-2.5 rounded-lg font-medium text-red-800 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 text-xs p-2.5 rounded-lg font-medium text-green-800 bg-green-50 border border-green-200">
          {successMsg}
        </div>
      )}

      {currentResumeUrl ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">Candidate_Resume.pdf</p>
                <p className="text-[11px] text-gray-500">Available to prospective workshop employers</p>
              </div>
            </div>

            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            >
              <ExternalLink size={12} />
              <span>View</span>
            </a>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={uploading ? "animate-spin" : ""} />
              <span>Replace Resume</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteResume}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            {uploading ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <UploadCloud size={18} />}
          </div>
          <p className="text-xs font-bold text-gray-800">
            {uploading ? "Uploading document…" : "Upload Your Resume"}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            PDF, DOCX, or DOC up to 5MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
