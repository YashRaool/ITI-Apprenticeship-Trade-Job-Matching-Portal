import { useState } from "react";
import { employerApi } from "../lib/api";
import { EmployerProfileInput, EmployerProfileDto } from "@iti-portal/shared";
import { Loader2, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Label, Select } from "./ui/Form";

interface Props {
  initialData?: EmployerProfileDto | null;
  onSave: () => void;
  onCancel: () => void;
}

const INDUSTRY_TYPES = [
  "Automotive",
  "Construction",
  "Electronics",
  "Fabrication & Welding",
  "HVAC",
  "IT & Telecommunications",
  "Manufacturing",
  "Oil & Gas",
  "Plumbing & Pipefitting",
  "Power & Energy",
  "Textile",
  "Other",
];

export default function EmployerProfileForm({ initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<EmployerProfileInput>({
    workshopName: initialData?.workshopName ?? "",
    industryType: initialData?.industryType ?? "",
    location: initialData?.location ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    description: initialData?.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof EmployerProfileInput, v: string) =>
    setFormData((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await employerApi.updateProfile({
        ...formData,
        contactPhone: formData.contactPhone?.trim() || null,
        description: formData.description?.trim() || null,
      });
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? err.response?.data?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="md:col-span-2">
          <Label required className="text-gray-700">Workshop / Company Legal Name</Label>
          <Input
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="e.g. Apex Precision Auto Engineering Works"
            value={formData.workshopName}
            onChange={(e) => set("workshopName", e.target.value)}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label required className="text-gray-700">Industry Domain</Label>
          <Select
            required
            value={formData.industryType}
            onChange={(e) => set("industryType", e.target.value)}
            className="bg-white border-gray-300 text-gray-900"
          >
            <option value="">Select industry sector…</option>
            {INDUSTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label required className="text-gray-700">Operating City / Location</Label>
          <Input
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="e.g. Pune, Maharashtra"
            value={formData.location}
            onChange={(e) => set("location", e.target.value)}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-gray-700">Contact Phone (10 digits)</Label>
          <Input
            type="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={formData.contactPhone || ""}
            onChange={(e) => set("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="bg-white border-gray-300 text-gray-900"
          />
          <p className="text-[11px] text-gray-500 mt-1">Used for direct candidate contact and interview coordination.</p>
        </div>

        <div className="md:col-span-2">
          <Label className="text-gray-700">Workshop &amp; Facility Description</Label>
          <textarea
            rows={3}
            maxLength={2000}
            placeholder="Describe your plant, equipment, training facilities, and safety standards…"
            value={formData.description || ""}
            onChange={(e) => set("description", e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs sm:text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="text-xs p-3 rounded-lg font-medium text-red-800 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-4 transition-colors"
        >
          <X size={15} /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Save Company Profile</span>
        </button>
      </div>
    </motion.form>
  );
}
