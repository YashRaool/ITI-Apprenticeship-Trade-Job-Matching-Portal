import * as studentRepository from "../repositories/studentRepository";
import { StudentProfileInput } from "@iti-portal/shared";
import { getMaxTradeSkills } from "./settingsService";

export async function getStudentProfile(userId: string) {
  return await studentRepository.findStudentProfileByUserId(userId);
}

export async function updateStudentProfile(userId: string, data: StudentProfileInput) {
  const cap = await getMaxTradeSkills();
  if (data.tradeSkills.length > cap) {
    const err = new Error(`Max ${cap} trade skills allowed`) as Error & { status: number };
    err.status = 400;
    throw err;
  }
  return await studentRepository.upsertStudentProfile(userId, data);
}

export async function uploadResume(userId: string, resumeUrl: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Student profile not found. Please complete profile first."), { status: 400 });
    throw err;
  }
  return await studentRepository.updateStudentResume(userId, resumeUrl);
}

export async function removeResume(userId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Student profile not found"), { status: 400 });
    throw err;
  }
  return await studentRepository.updateStudentResume(userId, null);
}

export async function getStudentCertifications(userId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    return [];
  }
  return await studentRepository.findCertificationsByStudentId(profile.id);
}

export async function uploadCertification(userId: string, title: string, proofUrl: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    throw new Error("Student profile not found. Please complete profile first.");
  }
  return await studentRepository.createCertification(profile.id, title, proofUrl);
}

export async function deleteCertification(userId: string, certId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) throw new Error("Student profile not found");
  
  const cert = await studentRepository.findCertificationById(certId);
  if (!cert || cert.studentId !== profile.id) {
    throw new Error("Certification not found or access denied");
  }

  return await studentRepository.deleteCertification(certId);
}

// ─── Applications & Recommendations ───────────────────────────────────────────

export async function getRecommendedJobs(userId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile || !profile.tradeSkills || profile.tradeSkills.length === 0) {
    return [];
  }
  return await studentRepository.getRecommendedJobs(profile.tradeSkills);
}

import * as jobRepository from "../repositories/jobRepository";

export async function applyToJob(userId: string, jobId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Complete your student profile before applying"), { status: 400 });
    throw err;
  }
  
  const job = await jobRepository.findActiveJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Active job posting not found"), { status: 404 });
    throw err;
  }
  
  const alreadyApplied = await studentRepository.checkApplicationExists(profile.id, jobId);
  if (alreadyApplied) {
    const err = Object.assign(new Error("You have already applied to this job"), { status: 400 });
    throw err;
  }
  
  return await studentRepository.createApplication(profile.id, jobId);
}

export async function getOwnApplications(userId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) return [];
  return await studentRepository.findApplicationsByStudentId(profile.id);
}

export async function withdrawApplication(userId: string, applicationId: string) {
  const profile = await studentRepository.findStudentProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Student profile not found"), { status: 404 });
    throw err;
  }
  
  const app = await studentRepository.findApplicationById(applicationId);
  if (!app) {
    const err = Object.assign(new Error("Application not found"), { status: 404 });
    throw err;
  }
  
  if (app.studentId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  
  if (app.status !== "applied") {
    const err = Object.assign(new Error("Cannot withdraw application once it has been viewed or processed by the employer"), { status: 400 });
    throw err;
  }
  
  return await studentRepository.deleteApplication(applicationId);
}
