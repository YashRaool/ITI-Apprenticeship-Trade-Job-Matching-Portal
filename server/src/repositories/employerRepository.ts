import { prisma } from "../lib/prisma";
import { EmployerProfileInput, JobPostingInput, JobPostingUpdateInput } from "@iti-portal/shared";

// ─── Employer Profile ─────────────────────────────────────────────────────────

export async function findEmployerProfileByUserId(userId: string) {
  return prisma.employerProfile.findUnique({ where: { userId } });
}

export async function findEmployerProfileById(id: string) {
  return prisma.employerProfile.findUnique({ where: { id } });
}

export async function upsertEmployerProfile(userId: string, data: EmployerProfileInput) {
  return prisma.employerProfile.upsert({
    where: { userId },
    update: {
      workshopName: data.workshopName,
      industryType: data.industryType,
      location: data.location,
      contactPhone: data.contactPhone ?? null,
      description: data.description ?? null,
    },
    create: {
      userId,
      workshopName: data.workshopName,
      industryType: data.industryType,
      location: data.location,
      contactPhone: data.contactPhone ?? null,
      description: data.description ?? null,
    },
  });
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export async function findJobsByEmployerId(employerId: string) {
  return prisma.jobPosting.findMany({
    where: { employerId },
    include: { tradeSkill: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function findJobById(id: string) {
  return prisma.jobPosting.findUnique({
    where: { id },
    include: { tradeSkill: true },
  });
}

export async function createJob(employerId: string, data: JobPostingInput) {
  return prisma.jobPosting.create({
    data: {
      employerId,
      title: data.title,
      tradeSkillId: data.tradeSkillId,
      location: data.location,
      description: data.description,
      jobType: (data.jobType as any) || "apprenticeship",
    },
    include: { tradeSkill: true },
  });
}

export async function updateJob(id: string, data: JobPostingUpdateInput) {
  return prisma.jobPosting.update({
    where: { id },
    data: {
      title: data.title,
      tradeSkillId: data.tradeSkillId,
      location: data.location,
      description: data.description,
      ...(data.status ? { status: data.status as any } : {}),
      ...(data.jobType ? { jobType: data.jobType as any } : {}),
    },
    include: { tradeSkill: true },
  });
}

export async function deleteJob(id: string) {
  return prisma.jobPosting.delete({ where: { id } });
}

export async function tradeSkillExists(id: string) {
  const skill = await prisma.tradeSkill.findUnique({ where: { id }, select: { id: true } });
  return skill !== null;
}

// ─── Applicant Management ─────────────────────────────────────────────────────

export async function findApplicationsByJobId(jobId: string) {
  return prisma.application.findMany({
    where: { jobId },
    include: {
      student: {
        include: {
          user: { select: { email: true } },
          certifications: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
    },
  });
}

export async function updateApplicationStatus(id: string, status: any) {
  return prisma.application.update({
    where: { id },
    data: { status },
  });
}

export async function checkJobHasApplications(jobId: string) {
  const count = await prisma.application.count({
    where: { jobId },
  });
  return count > 0;
}
