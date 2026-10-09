import * as messageRepository from "../repositories/messageRepository";
import { prisma } from "../lib/prisma";

export async function getOrCreateConversation(userId: string, role: string, jobId: string, targetStudentId?: string) {
  let studentProfileId: string;
  let employerProfileId: string;

  if (role === "student") {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) {
      const err = new Error("Student profile not found") as Error & { status: number };
      err.status = 400;
      throw err;
    }
    studentProfileId = studentProfile.id;

    // Check application context
    const application = await prisma.application.findUnique({
      where: { jobId_studentId: { jobId, studentId: studentProfileId } },
      include: { job: true },
    });

    if (!application) {
      const err = new Error("You must apply to this job before starting a conversation") as Error & { status: number };
      err.status = 403;
      throw err;
    }

    employerProfileId = application.job.employerId;
  } else if (role === "employer") {
    const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employerProfile) {
      const err = new Error("Employer profile not found") as Error & { status: number };
      err.status = 400;
      throw err;
    }
    employerProfileId = employerProfile.id;

    if (!targetStudentId) {
      const err = new Error("Student ID is required") as Error & { status: number };
      err.status = 400;
      throw err;
    }
    studentProfileId = targetStudentId;

    // Verify job belongs to employer
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== employerProfileId) {
      const err = new Error("Job not found or access denied") as Error & { status: number };
      err.status = 403;
      throw err;
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { jobId_studentId: { jobId, studentId: studentProfileId } },
    });

    if (!application) {
      const err = new Error("No application found for this candidate") as Error & { status: number };
      err.status = 404;
      throw err;
    }
  } else {
    const err = new Error("Forbidden") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  let conversation = await messageRepository.findConversationByJobAndStudent(jobId, studentProfileId);
  if (!conversation) {
    conversation = await messageRepository.createConversation(jobId, studentProfileId, employerProfileId);
  }

  return conversation;
}

export async function getUserConversations(userId: string, role: string) {
  if (role === "student") {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) return [];

    const conversations = await messageRepository.findConversationsByStudentId(studentProfile.id);
    return await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await messageRepository.countUnreadMessages(conv.id, userId);
        return {
          ...conv,
          latestMessage: conv.messages[0] || null,
          unreadCount,
        };
      })
    );
  } else if (role === "employer") {
    const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employerProfile) return [];

    const conversations = await messageRepository.findConversationsByEmployerId(employerProfile.id);
    return await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await messageRepository.countUnreadMessages(conv.id, userId);
        return {
          ...conv,
          latestMessage: conv.messages[0] || null,
          unreadCount,
        };
      })
    );
  }

  return [];
}

export async function getConversationDetails(userId: string, role: string, conversationId: string) {
  const conversation = await messageRepository.findConversationById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Security check: verify user is participant
  const isStudentParticipant = conversation.student.userId === userId;
  const isEmployerParticipant = conversation.employer.userId === userId;

  if (!isStudentParticipant && !isEmployerParticipant) {
    const err = new Error("Access denied to this conversation") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const unreadCount = await messageRepository.countUnreadMessages(conversationId, userId);

  return {
    ...conversation,
    unreadCount,
  };
}

export async function sendMessage(userId: string, role: string, conversationId: string, content: string) {
  const conversation = await messageRepository.findConversationById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const isStudentParticipant = conversation.student.userId === userId;
  const isEmployerParticipant = conversation.employer.userId === userId;

  if (!isStudentParticipant && !isEmployerParticipant) {
    const err = new Error("Access denied to this conversation") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const receiverId = isStudentParticipant ? conversation.employer.userId : conversation.student.userId;
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    const err = new Error("Message content cannot be empty") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  if (trimmedContent.length > 2000) {
    const err = new Error("Message content exceeds maximum allowed length (2000 characters)") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  return messageRepository.createMessage(conversationId, userId, receiverId, trimmedContent);
}

export async function markConversationRead(userId: string, role: string, conversationId: string) {
  const conversation = await messageRepository.findConversationById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const isStudentParticipant = conversation.student.userId === userId;
  const isEmployerParticipant = conversation.employer.userId === userId;

  if (!isStudentParticipant && !isEmployerParticipant) {
    const err = new Error("Access denied") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  await messageRepository.markMessagesAsRead(conversationId, userId);
  return { success: true };
}
