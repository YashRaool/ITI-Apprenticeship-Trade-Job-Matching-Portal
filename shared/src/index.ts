// ─── User Roles ───────────────────────────────────────────────────────────────
export enum UserRole {
  STUDENT = "student",
  EMPLOYER = "employer",
  ADMIN = "admin",
}

// ─── Application Status ────────────────────────────────────────────────────────
export enum ApplicationStatus {
  APPLIED = "applied",
  VIEWED = "viewed",
  SHORTLISTED = "shortlisted",
  REJECTED = "rejected",
  HIRED = "hired",
}

// ─── Job Posting Status ────────────────────────────────────────────────────────
export enum JobStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  CLOSED = "closed",
}

// ─── Job Type ─────────────────────────────────────────────────────────────────
export enum JobType {
  APPRENTICESHIP = "apprenticeship",
  FULL_TIME = "full_time",
}

// ─── Certification Verification ───────────────────────────────────────────────
export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

// ─── Trade Skill Categories ───────────────────────────────────────────────────
export enum TradeCategory {
  ELECTRICAL = "Electrical",
  MECHANICAL = "Mechanical",
  CIVIL = "Civil",
  FABRICATION = "Fabrication",
  GENERAL = "General",
}

// ─── Shared DTO shapes (consumed by both client and server) ───────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
import { z } from "zod";

export const TradeSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.nativeEnum(TradeCategory).or(z.string()),
});

export const StudentProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  itiInstitute: z.string().min(2, "Institute must be at least 2 characters").max(100, "Institute too long").optional().nullable(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().nullable(),
  location: z.string().max(100, "Location too long").optional().nullable(),
  tradeSkills: z.array(z.string()).min(1, "Select at least one trade skill"),
  resumeUrl: z.string().optional().nullable(),
});

export type StudentProfileInput = z.infer<typeof StudentProfileSchema>;
export type TradeSkillDto = z.infer<typeof TradeSkillSchema>;

export interface StudentProfileDto extends StudentProfileInput {
  id: string;
  userId: string;
  tradeSkills: string[];
  tradeSkillsDetails?: TradeSkillDto[];
  resumeUrl?: string | null;
}

export const CertificationUploadSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title too long"),
});

export type CertificationUploadInput = z.infer<typeof CertificationUploadSchema>;

export interface CertificationDto {
  id: string;
  studentId: string;
  title: string;
  proofUrl: string;
  verificationStatus: VerificationStatus;
}

// ─── Employer Profile ─────────────────────────────────────────────────────────
export const EmployerProfileSchema = z.object({
  workshopName: z.string().min(2, "Workshop name must be at least 2 characters").max(100, "Workshop name too long"),
  industryType: z.string().min(2, "Industry type required").max(60, "Industry type too long"),
  location: z.string().min(2, "Location required").max(100, "Location too long"),
  contactPhone: z.string().regex(/^\d{10}$/, "Contact phone must be 10 digits").optional().nullable().or(z.literal("")),
  description: z.string().max(2000, "Description too long").optional().nullable(),
});

export type EmployerProfileInput = z.infer<typeof EmployerProfileSchema>;

export interface EmployerProfileDto extends EmployerProfileInput {
  id: string;
  userId: string;
  verified: boolean;
  contactPhone?: string | null;
  description?: string | null;
}

// ─── Job Posting ──────────────────────────────────────────────────────────────
export const JobPostingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title too long"),
  tradeSkillId: z.string().min(1, "Trade skill is required"),
  location: z.string().min(2, "Location required").max(100, "Location too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(3000, "Description too long"),
  jobType: z.enum(["apprenticeship", "full_time"]).default("apprenticeship"),
});

export const JobPostingUpdateSchema = JobPostingSchema.partial().extend({
  status: z.enum(["active", "closed"]).optional(),
});

export type JobPostingInput = z.infer<typeof JobPostingSchema>;
export type JobPostingUpdateInput = z.infer<typeof JobPostingUpdateSchema>;

export interface JobPostingDto {
  id: string;
  employerId: string;
  title: string;
  tradeSkillId: string;
  tradeSkill?: TradeSkillDto;
  location: string;
  description: string;
  status: "draft" | "active" | "closed";
  jobType: "apprenticeship" | "full_time";
  createdAt: string;
}

// ─── Application ──────────────────────────────────────────────────────────────
export const ApplicationSchema = z.object({
  jobPostingId: z.string().min(1, "Job posting ID is required"),
});

export const ApplicationStatusUpdateSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;
export type ApplicationStatusUpdateInput = z.infer<typeof ApplicationStatusUpdateSchema>;

export interface ApplicationDto {
  id: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  createdAt: string;
  job?: JobPostingDto;
  student?: StudentProfileDto & { user?: { email: string }, certifications?: CertificationDto[] };
}

// ─── Interview Enums ──────────────────────────────────────────────────────────
export enum InterviewMode {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
}

export enum InterviewStatus {
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

// ─── Chat / Messaging ─────────────────────────────────────────────────────────
export const CreateConversationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});

export const SendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long (max 2000 chars)"),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  jobId: string;
  studentId: string;
  employerId: string;
  createdAt: string;
  updatedAt: string;
  job?: { id: string; title: string; location: string };
  student?: { id: string; name: string; userId: string };
  employer?: { id: string; workshopName: string; userId: string };
  messages?: MessageDto[];
  latestMessage?: MessageDto | null;
  unreadCount?: number;
}

// ─── Interview Scheduling ─────────────────────────────────────────────────────
export const CreateInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title max 100 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  notes: z.string().max(1000, "Notes max 1000 characters").optional().nullable(),
});

export const UpdateInterviewStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "CANCELLED", "COMPLETED"]),
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type UpdateInterviewStatusInput = z.infer<typeof UpdateInterviewStatusSchema>;

export interface InterviewDto {
  id: string;
  applicationId: string;
  employerId: string;
  studentId: string;
  title: string;
  date: string;
  time: string;
  mode: InterviewMode;
  notes?: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    job?: { id: string; title: string };
    student?: { id: string; name: string };
  };
  employer?: { id: string; workshopName: string; location: string };
  student?: { id: string; name: string; phone?: string | null };
}

