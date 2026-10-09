import * as employerRepository from "../repositories/employerRepository";
import { EmployerProfileInput, JobPostingInput, JobPostingUpdateInput } from "@iti-portal/shared";

// ─── Employer Profile ─────────────────────────────────────────────────────────

export async function getEmployerProfile(userId: string) {
  return employerRepository.findEmployerProfileByUserId(userId);
}

export async function upsertEmployerProfile(userId: string, data: EmployerProfileInput) {
  return employerRepository.upsertEmployerProfile(userId, data);
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export async function getOwnJobs(userId: string) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) return [];
  return employerRepository.findJobsByEmployerId(profile.id);
}

export async function getOwnJob(userId: string, jobId: string) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Employer profile not found"), { status: 404 });
    throw err;
  }
  const job = await employerRepository.findJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Job posting not found"), { status: 404 });
    throw err;
  }
  if (job.employerId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  return job;
}

export async function createJob(userId: string, data: JobPostingInput) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Complete your employer profile before posting a job"), { status: 400 });
    throw err;
  }
  const skillExists = await employerRepository.tradeSkillExists(data.tradeSkillId);
  if (!skillExists) {
    const err = Object.assign(new Error("Invalid trade skill"), { status: 400 });
    throw err;
  }
  return employerRepository.createJob(profile.id, data);
}

export async function updateJob(userId: string, jobId: string, data: JobPostingUpdateInput) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Employer profile not found"), { status: 404 });
    throw err;
  }
  const job = await employerRepository.findJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Job posting not found"), { status: 404 });
    throw err;
  }
  if (job.employerId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  if (data.tradeSkillId) {
    const skillExists = await employerRepository.tradeSkillExists(data.tradeSkillId);
    if (!skillExists) {
      const err = Object.assign(new Error("Invalid trade skill"), { status: 400 });
      throw err;
    }
  }
  return employerRepository.updateJob(jobId, data);
}

export async function deleteJob(userId: string, jobId: string) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Employer profile not found"), { status: 404 });
    throw err;
  }
  const job = await employerRepository.findJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Job posting not found"), { status: 404 });
    throw err;
  }
  if (job.employerId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  
  const hasApplications = await employerRepository.checkJobHasApplications(jobId);
  if (hasApplications) {
    const err = Object.assign(new Error("Cannot delete job posting with existing applications. Please close the posting instead."), { status: 409 });
    throw err;
  }
  
  return employerRepository.deleteJob(jobId);
}

// ─── Applicant Management ─────────────────────────────────────────────────────

export async function getJobApplicants(userId: string, jobId: string) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Employer profile not found"), { status: 404 });
    throw err;
  }
  
  const job = await employerRepository.findJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Job posting not found"), { status: 404 });
    throw err;
  }
  
  if (job.employerId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  
  return employerRepository.findApplicationsByJobId(jobId);
}

export async function updateApplicantStatus(userId: string, jobId: string, applicationId: string, status: any) {
  const profile = await employerRepository.findEmployerProfileByUserId(userId);
  if (!profile) {
    const err = Object.assign(new Error("Employer profile not found"), { status: 404 });
    throw err;
  }
  
  const job = await employerRepository.findJobById(jobId);
  if (!job) {
    const err = Object.assign(new Error("Job posting not found"), { status: 404 });
    throw err;
  }
  
  if (job.employerId !== profile.id) {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    throw err;
  }
  
  const application = await employerRepository.findApplicationById(applicationId);
  if (!application) {
    const err = Object.assign(new Error("Application not found"), { status: 404 });
    throw err;
  }
  
  if (application.jobId !== jobId) {
    const err = Object.assign(new Error("Application does not belong to this job posting"), { status: 400 });
    throw err;
  }
  
  return employerRepository.updateApplicationStatus(applicationId, status);
}
