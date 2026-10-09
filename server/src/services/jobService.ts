import * as jobRepository from "../repositories/jobRepository";

export async function getActiveJobs(params: {
  tradeSkillId?: string;
  location?: string;
  search?: string;
  jobType?: string;
  page?: number;
  limit?: number;
}) {
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const page = params.page && params.page > 0 ? params.page : 1;
  const skip = (page - 1) * limit;

  const { jobs, total } = await jobRepository.findActiveJobs({
    tradeSkillId: params.tradeSkillId,
    location: params.location,
    search: params.search,
    jobType: params.jobType,
    skip,
    take: limit,
  });

  return {
    data: jobs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getActiveJobById(id: string) {
  const job = await jobRepository.findActiveJobById(id);
  if (!job) {
    const err = Object.assign(new Error("Job not found"), { status: 404 });
    throw err;
  }
  return job;
}
