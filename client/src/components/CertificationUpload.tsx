import { useState, useRef } from "react";
import { studentApi } from "../lib/api";
import { UploadCloud, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Label } from "./ui/Form";

interface Props {
  onSuccess: () => void;
}

export default function CertificationUpload({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError("Document file size must be less than 5MB");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await studentApi.uploadCertification(title.trim(), file);
      setFile(null);
      setTitle("");
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud size={18} className="text-blue-600" />
          Upload Certificate
        </h3>
        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
          PDF / JPG / PNG &lt; 5MB
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <Label required className="text-gray-700">Certificate or Trade Title</Label>
          <Input
            type="text"
            placeholder="e.g. NCVT National Trade Certificate (Electrician)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label required className="text-gray-700">Document File</Label>
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mb-2">
                <UploadCloud size={20} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                Click to browse or drag file here
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Upload your official mark sheet, NCVT/SCVT, or apprenticeship proof
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-blue-600 shrink-0" size={18} />
                <div className="truncate text-left">
                  <p className="text-xs font-semibold text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-200"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs p-2.5 rounded-lg font-medium text-red-800 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-xs p-2.5 rounded-lg font-medium flex items-center gap-2 text-green-800 bg-green-50 border border-green-200">
            <CheckCircle2 size={15} /> Certificate uploaded successfully!
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || !title.trim() || uploading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 w-full py-2.5 text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Uploading Document…</span>
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              <span>Submit for Verification</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
