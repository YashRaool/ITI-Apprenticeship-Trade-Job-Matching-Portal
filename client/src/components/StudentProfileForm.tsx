import { useState, useEffect } from "react";
import { studentApi, tradeSkillApi } from "../lib/api";
import { StudentProfileInput, TradeSkillDto } from "@iti-portal/shared";
import { CheckCircle2, Circle, Loader2, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Label } from "./ui/Form";

interface Props {
  initialData?: StudentProfileInput;
  onSave: () => void;
  onCancel: () => void;
}

export default function StudentProfileForm({ initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<StudentProfileInput>({
    name: initialData?.name || "",
    itiInstitute: initialData?.itiInstitute || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    tradeSkills: initialData?.tradeSkills || [],
  });

  const [groupedSkills, setGroupedSkills] = useState<Record<string, TradeSkillDto[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tradeSkillApi
      .getGrouped()
      .then((res) => {
        setGroupedSkills(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load trade skills");
        setLoading(false);
      });
  }, []);

  const toggleSkill = (id: string) => {
    setFormData((prev) => {
      const skills = prev.tradeSkills || [];
      if (skills.includes(id)) {
        return { ...prev, tradeSkills: skills.filter((s) => s !== id) };
      }
      if (skills.length >= 5) return prev; // max 5
      return { ...prev, tradeSkills: [...skills, id] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await studentApi.updateProfile(formData);
      onSave();
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Failed to save profile. Please check your entries."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-xs text-gray-500">Loading profile data…</p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Label required className="text-gray-700">Full Candidate Name</Label>
          <Input
            type="text"
            required
            minLength={2}
            maxLength={50}
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label required className="text-gray-700">Phone Number (10 Digits)</Label>
          <Input
            type="text"
            pattern="\d{10}"
            title="10 digit phone number"
            placeholder="e.g. 9876543210"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label className="text-gray-700">ITI Institute / Training Center</Label>
          <Input
            type="text"
            placeholder="e.g. Government ITI Pusa, Delhi"
            value={formData.itiInstitute || ""}
            onChange={(e) => setFormData({ ...formData, itiInstitute: e.target.value })}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label className="text-gray-700">Current Location / City</Label>
          <Input
            type="text"
            placeholder="e.g. Mumbai, Maharashtra"
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>
      </div>

      {/* Trade Skills */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Label className="mb-0 text-gray-700">
            Certified Trade Skills <span className="text-gray-500 text-xs font-normal">(Select up to 5)</span>
          </Label>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-blue-600 border border-gray-200">
            {(formData.tradeSkills?.length || 0)} / 5 selected
          </span>
        </div>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const selected = formData.tradeSkills?.includes(skill.id);
                  return (
                    <button
                      type="button"
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-blue-400"
                      }`}
                    >
                      {selected ? <CheckCircle2 size={13} /> : <Circle size={13} className="text-gray-400" />}
                      <span>{skill.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-xs p-3 rounded-lg font-medium text-red-800 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {/* Actions */}
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
          disabled={saving || (formData.tradeSkills?.length || 0) === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs sm:text-sm py-2 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Save Profile</span>
        </button>
      </div>
    </motion.form>
  );
}
