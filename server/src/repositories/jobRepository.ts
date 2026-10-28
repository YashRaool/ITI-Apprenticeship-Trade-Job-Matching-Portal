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

  if (params.tradeSkillId && params.tradeSkillId.trim()) {
    const skill = params.tradeSkillId.trim();
    where.tradeSkill = {
      OR: [
        { id: skill },
        { name: { equals: skill, mode: "insensitive" } },
      ],
    };
  }
  if (params.location && params.location.trim()) {
    where.location = { contains: params.location.trim(), mode: "insensitive" };
  }
  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { employer: { workshopName: { contains: term, mode: "insensitive" } } },
    ];
  }
  if (params.jobType && (params.jobType === "apprenticeship" || params.jobType === "full_time")) {
    where.jobType = params.jobType;
  }

  const total = await prisma.jobPosting.count({ where });
  let skip = params.skip || 0;
  if (total > 0 && skip >= total) {
    const take = params.take || 10;
    const lastPage = Math.ceil(total / take) || 1;
    skip = (lastPage - 1) * take;
  }

  const jobs = await prisma.jobPosting.findMany({
    where,
    include: {
      tradeSkill: true,
      employer: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: params.take,
  });

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
