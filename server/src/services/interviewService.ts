import * as interviewRepository from "../repositories/interviewRepository";
import { prisma } from "../lib/prisma";
import { InterviewMode, InterviewStatus } from "@prisma/client";

export async function scheduleInterview(
  userId: string,
  role: string,
  data: {
    applicationId: string;
    title: string;
    date: string;
    time: string;
    mode: "ONLINE" | "IN_PERSON";
    notes?: string | null;
  }
) {
  if (role !== "employer") {
    const err = new Error("Only employers can schedule interviews") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!employerProfile) {
    const err = new Error("Employer profile not found") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const application = await prisma.application.findUnique({
    where: { id: data.applicationId },
    include: { job: true },
  });

  if (!application) {
    const err = new Error("Application not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (application.job.employerId !== employerProfile.id) {
    const err = new Error("Access denied: You do not own this job posting") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const interviewDate = new Date(data.date);
  if (isNaN(interviewDate.getTime())) {
    const err = new Error("Invalid date format") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(interviewDate);
  checkDate.setHours(0, 0, 0, 0);
  if (checkDate < now) {
    const err = new Error("Interview date cannot be in the past") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  return interviewRepository.createInterview({
    applicationId: data.applicationId,
    employerId: employerProfile.id,
    studentId: application.studentId,
    title: data.title,
    date: interviewDate,
    time: data.time,
    mode: data.mode as InterviewMode,
    notes: data.notes,
  });
}

export async function getUserInterviews(userId: string, role: string) {
  if (role === "student") {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) return [];
    return interviewRepository.findInterviewsByStudentId(studentProfile.id);
  } else if (role === "employer") {
    const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employerProfile) return [];
    return interviewRepository.findInterviewsByEmployerId(employerProfile.id);
  }
  return [];
}

export async function updateInterview(
  userId: string,
  role: string,
  interviewId: string,
  data: {
    title?: string;
    date?: string;
    time?: string;
    mode?: "ONLINE" | "IN_PERSON";
    notes?: string | null;
  }
) {
  if (role !== "employer") {
    const err = new Error("Only employers can modify interview details") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!employerProfile) {
    const err = new Error("Employer profile not found") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const interview = await interviewRepository.findInterviewById(interviewId);
  if (!interview) {
    const err = new Error("Interview not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (interview.employerId !== employerProfile.id) {
    const err = new Error("Access denied: You do not own this interview") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.time) updateData.time = data.time;
  if (data.mode) updateData.mode = data.mode as InterviewMode;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.date) {
    const dateObj = new Date(data.date);
    if (!isNaN(dateObj.getTime())) {
      updateData.date = dateObj;
    }
  }

  return interviewRepository.updateInterview(interviewId, updateData);
}

export async function updateInterviewStatus(
  userId: string,
  role: string,
  interviewId: string,
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED"
) {
  if (role !== "employer") {
    const err = new Error("Access denied: Only employers can modify interview status") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!employerProfile) {
    const err = new Error("Employer profile not found") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const interview = await interviewRepository.findInterviewById(interviewId);
  if (!interview) {
    const err = new Error("Interview not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (interview.employerId !== employerProfile.id) {
    const err = new Error("Access denied: You do not own this interview") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  return interviewRepository.updateInterview(interviewId, { status: status as InterviewStatus });
}
