import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: "student" | "employer" | "admin";
  isActive: boolean;
  createdAt: string;
  studentProfile: { name: string } | null;
  employerProfile: { workshopName: string; verified: boolean } | null;
}

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface AdminEmployer {
  id: string;
  workshopName: string;
  industryType: string;
  location: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  user: { id: string; email: string; isActive: boolean; createdAt: string };
  jobPostings: { id: string }[];
}

export interface AdminJob {
  id: string;
  title: string;
  location: string;
  description: string;
  status: "active" | "closed" | "draft";
  flaggedFraudulent: boolean;
  moderatedAt: string | null;     // non-null = formally removed from platform
  moderationReason: string | null;
  createdAt: string;
  tradeSkill: { id: string; name: string; category: string };
  employer: {
    id: string;
    workshopName: string;
    verified: boolean;
    user: { email: string };
  };
  _count: { applications: number };
}

export interface Analytics {
  totalStudents: number;
  totalEmployers: number;
  totalVerifiedEmployers: number;
  totalPendingEmployers: number;
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  flaggedJobs: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}

export interface AdminMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    role: "student" | "employer" | "admin";
    email: string;
  };
}

export interface AdminConversation {
  id: string;
  job: { id: string; title: string; location: string; jobType?: string };
  student: { id: string; name: string; userId: string; phone?: string | null; user: { id?: string; email: string } };
  employer: { id: string; workshopName: string; userId: string; contactPhone?: string | null; user: { id?: string; email: string } };
  latestMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    receiverId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConversationDetail extends AdminConversation {
  messages: AdminMessage[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const adminApi = {
  // Analytics
  getAnalytics: () =>
    api.get<{ success: boolean; data: Analytics }>("/admin/analytics"),

  // Users
  listUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<AdminUser>>("/admin/users", { params }),

  setUserStatus: (userId: string, isActive: boolean) =>
    api.patch<{ success: boolean; data: AdminUser }>(`/admin/users/${userId}/status`, { isActive }),

  // Employers – full paginated list
  listEmployers: (params?: {
    verificationStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<AdminEmployer>>("/admin/employers", { params }),

  verifyEmployer: (employerProfileId: string, verified: boolean) =>
    api.patch<{ success: boolean; data: { id: string; workshopName: string; verified: boolean; verificationStatus: string } }>(
      `/admin/employers/${employerProfileId}/verify`,
      { verified }
    ),

  // Jobs
  listJobs: (params?: { status?: string; flagged?: boolean; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<AdminJob>>("/admin/jobs", { params }),

  /** Soft-remove: sets flaggedFraudulent=true + moderatedAt. Applications preserved. */
  moderateJob: (jobId: string, reason?: string) =>
    api.patch<{ success: boolean; data: Pick<AdminJob, "id" | "flaggedFraudulent" | "moderatedAt" | "moderationReason"> }>(
      `/admin/jobs/${jobId}/moderate`,
      { reason }
    ),

  /** Restore: clears moderation state so job is visible again. */
  restoreJob: (jobId: string) =>
    api.patch<{ success: boolean; data: Pick<AdminJob, "id" | "flaggedFraudulent" | "moderatedAt" | "moderationReason"> }>(
      `/admin/jobs/${jobId}/restore`,
      {}
    ),

  // Messages Monitoring
  listConversations: (params?: {
    search?: string;
    filter?: "all" | "recent" | "unread";
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<AdminConversation>>("/admin/messages/conversations", { params }),

  getConversationDetails: (conversationId: string) =>
    api.get<{ success: boolean; data: AdminConversationDetail }>(`/admin/messages/conversations/${conversationId}`),
};

