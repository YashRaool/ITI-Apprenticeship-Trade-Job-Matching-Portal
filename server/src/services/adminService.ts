import * as adminRepository from "../repositories/adminRepository";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(params: {
  role?: string;
  search?: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;
  const { users, total } = await adminRepository.findAllUsers({
    role: params.role,
    search: params.search,
    skip,
    take: params.limit,
  });
  return {
    data: users,
    meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
  };
}

export async function setUserStatus(userId: string, isActive: boolean) {
  const user = await adminRepository.setUserStatus(userId, isActive);
  return user;
}

// ─── Employer Verification ────────────────────────────────────────────────────

export async function listAllEmployers(params: {
  verificationStatus?: string;
  search?: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;
  const { employers, total } = await adminRepository.findAllEmployersForAdmin({
    verificationStatus: params.verificationStatus,
    search: params.search,
    skip,
    take: params.limit,
  });
  return {
    data: employers,
    meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
  };
}

/** Legacy – still used by analytics */
export async function listPendingEmployers() {
  return adminRepository.findPendingEmployers();
}

export async function verifyEmployer(employerProfileId: string, verified: boolean) {
  const profile = await adminRepository.findEmployerProfileById(employerProfileId);
  if (!profile) {
    throw Object.assign(new Error("Employer profile not found"), { status: 404 });
  }
  return adminRepository.setEmployerVerified(employerProfileId, verified);
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export async function listAllJobs(params: {
  status?: string;
  flagged?: boolean;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;
  const { jobs, total } = await adminRepository.findAllJobs({
    status: params.status,
    flagged: params.flagged,
    skip,
    take: params.limit,
  });
  return {
    data: jobs,
    meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
  };
}

export async function moderateJob(jobId: string, reason?: string) {
  const job = await adminRepository.findJobById(jobId);
  if (!job) throw Object.assign(new Error("Job posting not found"), { status: 404 });
  return adminRepository.moderateJob(jobId, reason);
}

export async function restoreJob(jobId: string) {
  const job = await adminRepository.findJobById(jobId);
  if (!job) throw Object.assign(new Error("Job posting not found"), { status: 404 });
  return adminRepository.restoreJob(jobId);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  return adminRepository.getAnalytics();
}

// ─── Messages Monitoring ──────────────────────────────────────────────────────

export async function listAdminConversations(params: {
  search?: string;
  filter?: "all" | "recent" | "unread";
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;
  const { conversations, total } = await adminRepository.findAllConversationsForAdmin({
    search: params.search,
    filter: params.filter,
    skip,
    take: params.limit,
  });

  const formatted = conversations.map((conv) => ({
    id: conv.id,
    job: conv.job,
    student: conv.student,
    employer: conv.employer,
    latestMessage: conv.messages[0] || null,
    unreadCount: conv._count.messages,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }));

  return {
    data: formatted,
    meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
  };
}

export async function getAdminConversationDetails(conversationId: string) {
  const conversation = await adminRepository.findConversationByIdForAdmin(conversationId);
  if (!conversation) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }

  const unreadCount = conversation.messages.filter((m) => !m.isRead).length;

  return {
    ...conversation,
    unreadCount,
  };
}

