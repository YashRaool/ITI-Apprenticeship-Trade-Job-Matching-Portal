import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  withCredentials: true, // send httpOnly cookie on every request
});

// Token stored in memory — set by AuthContext after login/refresh
let _accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { _accessToken = t; };
export const getAccessToken = () => _accessToken;

// Attach Bearer token
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// On 401: try refresh once, then retry
let _refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }
    original._retried = true;

    if (!_refreshing) {
      _refreshing = api
        .post<{ success: boolean; data: { accessToken: string } }>("/auth/refresh")
        .then((r) => {
          const t = r.data.data.accessToken;
          setAccessToken(t);
          return t;
        })
        .catch(() => {
          setAccessToken(null);
          return null;
        })
        .finally(() => { _refreshing = null; });
    }

    const newToken = await _refreshing;
    if (!newToken) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  }
);

// ─── Phase 2: Student Profile APIs ───────────────────────────────────────────

import type {
  StudentProfileInput, StudentProfileDto, CertificationDto, TradeSkillDto,
  EmployerProfileInput, EmployerProfileDto, JobPostingInput, JobPostingUpdateInput, JobPostingDto, ApplicationDto,
  ConversationDto, MessageDto, InterviewDto, CreateInterviewInput
} from "@iti-portal/shared";

export const studentApi = {
  getProfile: () => api.get<{ success: boolean; data: StudentProfileDto }>("/students/me"),
  updateProfile: (data: StudentProfileInput) => api.put<{ success: boolean; data: StudentProfileDto }>("/students/me", data),
  getCertifications: () => api.get<{ success: boolean; data: CertificationDto[] }>("/students/me/certifications"),
  uploadCertification: (title: string, file: File) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("proofFile", file);
    return api.post<{ success: boolean; data: CertificationDto }>("/students/me/certifications", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  deleteCertification: (id: string) => api.delete<{ success: boolean; message: string }>(`/students/me/certifications/${id}`),
  getRecommendedJobs: () => api.get<{ success: boolean; data: JobPostingDto[] }>("/students/me/recommended-jobs"),
  getApplications: () => api.get<{ success: boolean; data: ApplicationDto[] }>("/students/me/applications"),
  withdrawApplication: (id: string) => api.delete<{ success: boolean; message: string }>(`/students/me/applications/${id}`),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post<{ success: boolean; data: StudentProfileDto; message: string }>("/students/me/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteResume: () => api.delete<{ success: boolean; data: StudentProfileDto; message: string }>("/students/me/resume"),
};

export const tradeSkillApi = {
  getGrouped: () => api.get<{ success: boolean; data: Record<string, TradeSkillDto[]> }>("/trade-skills"),
};

// ─── Phase 3: Employer APIs ───────────────────────────────────────────────────

export const employerApi = {
  getProfile: () => api.get<{ success: boolean; data: EmployerProfileDto | null }>("/employers/me"),
  updateProfile: (data: EmployerProfileInput) => api.put<{ success: boolean; data: EmployerProfileDto }>("/employers/me", data),
  getJobs: () => api.get<{ success: boolean; data: JobPostingDto[] }>("/employers/me/jobs"),
  getJob: (id: string) => api.get<{ success: boolean; data: JobPostingDto }>(`/employers/me/jobs/${id}`),
  createJob: (data: JobPostingInput) => api.post<{ success: boolean; data: JobPostingDto }>("/employers/me/jobs", data),
  updateJob: (id: string, data: JobPostingUpdateInput) => api.put<{ success: boolean; data: JobPostingDto }>(`/employers/me/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete<{ success: boolean; message: string }>(`/employers/me/jobs/${id}`),
};

// ─── Phase 4 (Batch 2): Chat & Interview APIs ────────────────────────────────

export const messageApi = {
  getConversations: () => api.get<{ success: boolean; data: ConversationDto[] }>("/messages/conversations"),
  getConversation: (id: string) => api.get<{ success: boolean; data: ConversationDto }>(`/messages/conversations/${id}`),
  createConversation: (jobId: string, studentId?: string) =>
    api.post<{ success: boolean; data: ConversationDto }>("/messages/conversations", { jobId, studentId }),
  sendMessage: (conversationId: string, content: string) =>
    api.post<{ success: boolean; data: MessageDto }>(`/messages/conversations/${conversationId}/messages`, { content }),
  markRead: (conversationId: string) =>
    api.patch<{ success: boolean }>(`/messages/conversations/${conversationId}/read`),
};

export const interviewApi = {
  scheduleInterview: (data: CreateInterviewInput) =>
    api.post<{ success: boolean; data: InterviewDto }>("/interviews", data),
  getMyInterviews: () =>
    api.get<{ success: boolean; data: InterviewDto[] }>("/interviews/me"),
  updateInterview: (id: string, data: Partial<CreateInterviewInput>) =>
    api.patch<{ success: boolean; data: InterviewDto }>(`/interviews/${id}`, data),
  updateInterviewStatus: (id: string, status: "SCHEDULED" | "CANCELLED" | "COMPLETED") =>
    api.patch<{ success: boolean; data: InterviewDto }>(`/interviews/${id}/status`, { status }),
};

