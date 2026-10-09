import { prisma } from "../lib/prisma";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function findAllUsers(params: {
  role?: string;
  search?: string;
  skip: number;
  take: number;
}) {
  const where: any = {};
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { email: { contains: params.search, mode: "insensitive" } },
      { studentProfile: { name: { contains: params.search, mode: "insensitive" } } },
      { employerProfile: { workshopName: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: { select: { name: true } },
        employerProfile: { select: { workshopName: true, verified: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

export async function setUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, email: true, role: true, isActive: true },
  });
}

// ─── Employer Verification ────────────────────────────────────────────────────

/** All employers for admin panel – searchable and filterable by verificationStatus */
export async function findAllEmployersForAdmin(params: {
  verificationStatus?: string;
  search?: string;
  skip: number;
  take: number;
}) {
  const where: any = {};
  if (params.verificationStatus) where.verificationStatus = params.verificationStatus;
  if (params.search) {
    where.OR = [
      { workshopName: { contains: params.search, mode: "insensitive" } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
      { location: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [employers, total] = await Promise.all([
    prisma.employerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, isActive: true, createdAt: true } },
        jobPostings: { select: { id: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
      skip: params.skip,
      take: params.take,
    }),
    prisma.employerProfile.count({ where }),
  ]);

  return { employers, total };
}

/** Legacy helper – still used for analytics count */
export async function findPendingEmployers() {
  return prisma.employerProfile.findMany({
    where: { verificationStatus: "pending" },
    include: {
      user: { select: { id: true, email: true, isActive: true, createdAt: true } },
      jobPostings: { select: { id: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });
}

export async function findEmployerProfileById(id: string) {
  return prisma.employerProfile.findUnique({ where: { id } });
}

export async function setEmployerVerified(
  employerProfileId: string,
  verified: boolean
) {
  const verificationStatus = verified ? "verified" : "rejected";
  return prisma.employerProfile.update({
    where: { id: employerProfileId },
    data: { verified, verificationStatus },
    select: {
      id: true,
      workshopName: true,
      verified: true,
      verificationStatus: true,
      userId: true,
    },
  });
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export async function findAllJobs(params: {
  status?: string;
  flagged?: boolean;
  skip: number;
  take: number;
}) {
  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.flagged !== undefined) where.flaggedFraudulent = params.flagged;

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      select: {
        id: true, title: true, location: true, description: true,
        status: true, flaggedFraudulent: true,
        moderatedAt: true, moderationReason: true,
        createdAt: true,
        tradeSkill: true,
        employer: {
          include: { user: { select: { email: true } } },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobs, total };
}

export async function findJobById(id: string) {
  return prisma.jobPosting.findUnique({ where: { id } });
}

export async function setJobFlagged(jobId: string, flaggedFraudulent: boolean) {
  return prisma.jobPosting.update({
    where: { id: jobId },
    data: { flaggedFraudulent },
    select: { id: true, title: true, flaggedFraudulent: true },
  });
}

/** Soft-remove: flags as fraudulent AND records moderation timestamp + reason.
 *  Applications are preserved. The job is hidden from all student-facing flows.
 */
export async function moderateJob(
  jobId: string,
  reason?: string
) {
  return prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      flaggedFraudulent: true,
      moderatedAt: new Date(),
      moderationReason: reason ?? null,
    },
    select: {
      id: true, title: true, flaggedFraudulent: true,
      moderatedAt: true, moderationReason: true,
    },
  });
}

/** Restore: clears moderation state — job becomes visible again (if status=active). */
export async function restoreJob(jobId: string) {
  return prisma.jobPosting.update({
    where: { id: jobId },
    data: { flaggedFraudulent: false, moderatedAt: null, moderationReason: null },
    select: {
      id: true, title: true, flaggedFraudulent: true,
      moderatedAt: true, moderationReason: true,
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const [
    totalStudents,
    totalEmployers,
    totalVerifiedEmployers,
    totalPendingEmployers,
    totalJobs,
    openJobs,
    closedJobs,
    flaggedJobs,
    totalApplications,
    appsByStatus,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "employer" } }),
    prisma.employerProfile.count({ where: { verificationStatus: "verified" } }),
    prisma.employerProfile.count({ where: { verificationStatus: "pending" } }),
    prisma.jobPosting.count(),
    prisma.jobPosting.count({ where: { status: "active" } }),
    prisma.jobPosting.count({ where: { status: "closed" } }),
    prisma.jobPosting.count({ where: { flaggedFraudulent: true } }),
    prisma.application.count(),
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const applicationsByStatus: Record<string, number> = {};
  for (const row of appsByStatus) {
    applicationsByStatus[row.status] = row._count._all;
  }

  return {
    totalStudents,
    totalEmployers,
    totalVerifiedEmployers,
    totalPendingEmployers,
    totalJobs,
    openJobs,
    closedJobs,
    flaggedJobs,
    totalApplications,
    applicationsByStatus,
  };
}

// ─── Messages Monitoring ──────────────────────────────────────────────────────

export async function findAllConversationsForAdmin(params: {
  search?: string;
  filter?: "all" | "recent" | "unread";
  skip: number;
  take: number;
}) {
  const where: any = {};

  if (params.search) {
    where.OR = [
      { student: { name: { contains: params.search, mode: "insensitive" } } },
      { student: { user: { email: { contains: params.search, mode: "insensitive" } } } },
      { employer: { workshopName: { contains: params.search, mode: "insensitive" } } },
      { employer: { user: { email: { contains: params.search, mode: "insensitive" } } } },
      { job: { title: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.filter === "unread") {
    where.messages = {
      some: { isRead: false },
    };
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        job: { select: { id: true, title: true, location: true } },
        student: {
          select: {
            id: true,
            name: true,
            userId: true,
            user: { select: { email: true } },
          },
        },
        employer: {
          select: {
            id: true,
            workshopName: true,
            userId: true,
            user: { select: { email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { isRead: false },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.conversation.count({ where }),
  ]);

  return { conversations, total };
}

export async function findConversationByIdForAdmin(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      job: { select: { id: true, title: true, location: true, jobType: true } },
      student: {
        select: {
          id: true,
          name: true,
          userId: true,
          phone: true,
          user: { select: { id: true, email: true } },
        },
      },
      employer: {
        select: {
          id: true,
          workshopName: true,
          userId: true,
          contactPhone: true,
          user: { select: { id: true, email: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, role: true, email: true },
          },
        },
      },
    },
  });
}

