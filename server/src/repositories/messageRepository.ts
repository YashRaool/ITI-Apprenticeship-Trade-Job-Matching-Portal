import { prisma } from "../lib/prisma";

export async function findConversationByJobAndStudent(jobId: string, studentId: string) {
  return prisma.conversation.findUnique({
    where: {
      jobId_studentId: { jobId, studentId },
    },
    include: {
      job: { select: { id: true, title: true, location: true, employerId: true } },
      student: { select: { id: true, name: true, userId: true } },
      employer: { select: { id: true, workshopName: true, userId: true } },
    },
  });
}

export async function createConversation(jobId: string, studentId: string, employerId: string) {
  return prisma.conversation.create({
    data: {
      jobId,
      studentId,
      employerId,
    },
    include: {
      job: { select: { id: true, title: true, location: true, employerId: true } },
      student: { select: { id: true, name: true, userId: true } },
      employer: { select: { id: true, workshopName: true, userId: true } },
    },
  });
}

export async function findConversationById(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      job: { select: { id: true, title: true, location: true, employerId: true } },
      student: { select: { id: true, name: true, userId: true } },
      employer: { select: { id: true, workshopName: true, userId: true } },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function findConversationsByStudentId(studentId: string) {
  return prisma.conversation.findMany({
    where: { studentId },
    include: {
      job: { select: { id: true, title: true, location: true } },
      employer: { select: { id: true, workshopName: true, userId: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findConversationsByEmployerId(employerId: string) {
  return prisma.conversation.findMany({
    where: { employerId },
    include: {
      job: { select: { id: true, title: true, location: true } },
      student: { select: { id: true, name: true, userId: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      receiverId,
      content,
    },
  });

  // Touch conversation updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  return prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function countUnreadMessages(conversationId: string, userId: string) {
  return prisma.message.count({
    where: {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
  });
}
