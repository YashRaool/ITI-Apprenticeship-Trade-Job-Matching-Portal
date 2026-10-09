import { prisma } from "../lib/prisma";

export async function findActiveJobs(params: {
  tradeSkillId?: string;
  location?: string;
  search?: string;
  jobType?: string;
  skip?: number;
  take?: number;
}) {
  const where: any = {
    status: "active",
    flaggedFraudulent: false, // hide admin-flagged (fraudulent) jobs from students
    employer: { verified: true }, // only show jobs from verified employers
  };

  if (params.tradeSkillId) {
    where.tradeSkillId = params.tradeSkillId;
  }
  if (params.location) {
    where.location = { contains: params.location, mode: "insensitive" };
  }
  if (params.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }
  if (params.jobType && (params.jobType === "apprenticeship" || params.jobType === "full_time")) {
    where.jobType = params.jobType;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      include: {
        tradeSkill: true,
        employer: true,
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobs, total };
}

export async function findActiveJobById(id: string) {
  return prisma.jobPosting.findFirst({
    where: {
      id,
      status: "active",
      flaggedFraudulent: false, // hide admin-flagged (fraudulent) jobs from students
      employer: { verified: true }, // only show jobs from verified employers
    },
    include: {
      tradeSkill: true,
      employer: true,
    },
  });
}
