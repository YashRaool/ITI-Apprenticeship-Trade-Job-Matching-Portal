import { useState, useEffect } from "react";
import { employerApi, tradeSkillApi } from "../lib/api";
import { JobPostingInput, JobPostingUpdateInput, JobPostingDto, TradeSkillDto } from "@iti-portal/shared";
import { Loader2, Save, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FormSection, Label, Input, Textarea, Select } from "./ui/Form";

interface Props {
  initialData?: JobPostingDto | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function JobPostingForm({ initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    tradeSkillId: initialData?.tradeSkillId ?? "",
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    jobType: (initialData?.jobType ?? "apprenticeship") as "apprenticeship" | "full_time",
    status: (initialData?.status ?? "active") as "active" | "closed",
  });
  const [groupedSkills, setGroupedSkills] = useState<Record<string, TradeSkillDto[]>>({});
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tradeSkillApi
      .getGrouped()
      .then((res) => {
        setGroupedSkills(res.data.data);
      })
      .catch(() => {
        setError("Failed to load trade skills");
      })
      .finally(() => setLoadingSkills(false));
  }, []);

  const set = (k: string, v: string) => setFormData((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (initialData?.id) {
        const payload: JobPostingUpdateInput = { ...formData };
        await employerApi.updateJob(initialData.id, payload);
      } else {
        const payload: JobPostingInput = {
          title: formData.title,
          tradeSkillId: formData.tradeSkillId,
          location: formData.location,
          description: formData.description,
          jobType: formData.jobType,
        };
        await employerApi.createJob(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? err.response?.data?.message ?? "Failed to save job posting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden w-full max-w-3xl mx-auto"
    >
      <div className="p-6 md:p-8">
        <FormSection title="Opportunity Details" description="Define the opening title, trade domain, job type, and status.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="md:col-span-2">
              <Label required className="text-gray-700">Opportunity / Job Title</Label>
              <Input
                type="text"
                required
                minLength={3}
                maxLength={120}
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Electrician Apprentice - Motor Rewinding"
                disabled={saving}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <Label required className="text-gray-700">Job Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  formData.jobType === "apprenticeship"
                    ? "bg-blue-50 border-blue-400 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                  <input
                    type="radio"
                    name="jobType"
                    value="apprenticeship"
                    checked={formData.jobType === "apprenticeship"}
                    onChange={() => set("jobType", "apprenticeship")}
                    className="text-blue-600"
                  />
                  <span>Apprenticeship</span>
                </label>
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  formData.jobType === "full_time"
                    ? "bg-blue-50 border-blue-400 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                  <input
                    type="radio"
                    name="jobType"
                    value="full_time"
                    checked={formData.jobType === "full_time"}
                    onChange={() => set("jobType", "full_time")}
                    className="text-blue-600"
                  />
                  <span>Full-Time Trade Job</span>
                </label>
              </div>
            </div>

            {initialData?.id && (
              <div className="md:col-span-2">
                <Label className="text-gray-700">Opportunity Status</Label>
                <Select value={formData.status} onChange={(e) => set("status", e.target.value)} disabled={saving} className="bg-white border-gray-300 text-gray-900">
                  <option value="active">Active - Receiving Candidate Applications</option>
                  <option value="closed">Closed - Not Accepting Applications</option>
                </Select>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Trade Skill Stream" description="Required trade qualification for incoming candidates.">
          <div>
            <Label required className="text-gray-700">Required Trade Specialization</Label>
            {loadingSkills ? (
              <div className="flex items-center gap-3 p-3 text-gray-500 bg-gray-50 rounded-lg animate-pulse text-xs">
                <Loader2 size={15} className="animate-spin text-blue-600" />
                <span>Loading trade specializations…</span>
              </div>
            ) : (
              <Select
                required
                value={formData.tradeSkillId}
                onChange={(e) => set("tradeSkillId", e.target.value)}
                disabled={saving}
                className="bg-white border-gray-300 text-gray-900"
              >
                <option value="">Select trade skill…</option>
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <optgroup key={category} label={category}>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </div>

          <div>
            <Label required className="text-gray-700">Job Description & Apprenticeship Scope</Label>
            <Textarea
              required
              minLength={10}
              maxLength={3000}
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Outline workshop tasks, safety requirements, stipend details, and mentorship provided to apprentices…"
              disabled={saving}
              className="bg-white border-gray-300 text-gray-900"
            />
            <p className="text-[11px] text-gray-500 mt-1 text-right">
              {formData.description.length} / 3000 characters
            </p>
          </div>
        </FormSection>

        <FormSection title="Work Location" description="City or facility location where training occurs.">
          <div>
            <Label required className="text-gray-700">Location</Label>
            <Input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={formData.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Pune, Maharashtra"
              disabled={saving}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </FormSection>

        {error && (
          <div className="mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 text-red-800 bg-red-50 border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-4 md:p-6 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-4 transition-colors"
        >
          <X size={15} /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-5 min-w-[150px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed justify-center"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>{initialData?.id ? "Update Posting" : "Publish Posting"}</span>
        </button>
      </div>
    </motion.form>
  );
}
