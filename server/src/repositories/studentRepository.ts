import { prisma } from "../lib/prisma";
import { StudentProfileInput } from "@iti-portal/shared";

export async function findStudentProfileByUserId(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  
  if (!profile) return null;

  // Fetch the actual TradeSkill objects based on the IDs stored in tradeSkills
  let tradeSkillDetails: any[] = [];
  if (profile.tradeSkills && profile.tradeSkills.length > 0) {
    tradeSkillDetails = await prisma.tradeSkill.findMany({
      where: { id: { in: profile.tradeSkills } }
    });
  }

  return {
    ...profile,
    tradeSkillsDetails: tradeSkillDetails
  };
}

export async function upsertStudentProfile(userId: string, data: StudentProfileInput) {
  const profile = await prisma.studentProfile.upsert({
    where: { userId },
    update: {
      name: data.name,
      itiInstitute: data.itiInstitute,
      phone: data.phone,
      location: data.location,
      tradeSkills: data.tradeSkills,
      ...(data.resumeUrl !== undefined ? { resumeUrl: data.resumeUrl } : {}),
    },
    create: {
      userId,
      name: data.name,
      itiInstitute: data.itiInstitute,
      phone: data.phone,
      location: data.location,
      tradeSkills: data.tradeSkills,
      resumeUrl: data.resumeUrl ?? null,
    },
  });
  
  return profile;
}

export async function updateStudentResume(userId: string, resumeUrl: string | null) {
  return await prisma.studentProfile.update({
    where: { userId },
    data: { resumeUrl },
  });
}

export async function findCertificationsByStudentId(studentId: string) {
  return await prisma.certification.findMany({
    where: { studentId },
    orderBy: { title: 'asc' },
  });
}

export async function createCertification(studentId: string, title: string, proofUrl: string) {
  return await prisma.certification.create({
    data: {
      studentId,
      title,
      proofUrl,
    },
  });
}

export async function findCertificationById(id: string) {
  return await prisma.certification.findUnique({
    where: { id },
  });
}

export async function deleteCertification(id: string) {
  return await prisma.certification.delete({
    where: { id },
  });
}

// ─── Applications & Recommendations ───────────────────────────────────────────

export async function getRecommendedJobs(tradeSkillIds: string[]) {
  if (!tradeSkillIds || tradeSkillIds.length === 0) return [];
  return prisma.jobPosting.findMany({
    where: {
      status: "active",
      tradeSkillId: { in: tradeSkillIds },
    },
    include: {
      tradeSkill: true,
      employer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function checkApplicationExists(studentId: string, jobId: string) {
  const app = await prisma.application.findUnique({
    where: { jobId_studentId: { jobId, studentId } },
  });
  return app !== null;
}

export async function createApplication(studentId: string, jobId: string) {
  return prisma.application.create({
    data: {
      studentId,
      jobId,
      status: "applied",
    },
  });
}

export async function findApplicationsByStudentId(studentId: string) {
  return prisma.application.findMany({
    where: { studentId },
    include: {
      job: {
        include: {
          employer: true,
          tradeSkill: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
  });
}

export async function deleteApplication(id: string) {
  return prisma.application.delete({
    where: { id },
  });
}
