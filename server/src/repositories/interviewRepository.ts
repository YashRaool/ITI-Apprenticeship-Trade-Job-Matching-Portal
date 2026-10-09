import { prisma } from "../lib/prisma";
import { InterviewMode, InterviewStatus } from "@prisma/client";

export async function createInterview(data: {
  applicationId: string;
  employerId: string;
  studentId: string;
  title: string;
  date: Date;
  time: string;
  mode: InterviewMode;
  notes?: string | null;
}) {
  return prisma.interview.create({
    data,
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, location: true } },
          student: { select: { id: true, name: true, phone: true } },
        },
      },
      employer: { select: { id: true, workshopName: true, location: true } },
      student: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function findInterviewById(id: string) {
  return prisma.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, location: true } },
          student: { select: { id: true, name: true, phone: true } },
        },
      },
      employer: { select: { id: true, workshopName: true, location: true } },
      student: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function findInterviewsByStudentId(studentId: string) {
  return prisma.interview.findMany({
    where: { studentId },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, location: true } },
        },
      },
      employer: { select: { id: true, workshopName: true, location: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function findInterviewsByEmployerId(employerId: string) {
  return prisma.interview.findMany({
    where: { employerId },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, location: true } },
          student: { select: { id: true, name: true, phone: true } },
        },
      },
      student: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function updateInterview(
  id: string,
  data: Partial<{
    title: string;
    date: Date;
    time: string;
    mode: InterviewMode;
    notes: string | null;
    status: InterviewStatus;
  }>
) {
  return prisma.interview.update({
    where: { id },
    data,
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, location: true } },
          student: { select: { id: true, name: true, phone: true } },
        },
      },
      employer: { select: { id: true, workshopName: true, location: true } },
      student: { select: { id: true, name: true, phone: true } },
    },
  });
}
