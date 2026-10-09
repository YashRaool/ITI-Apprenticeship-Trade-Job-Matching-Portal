import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireRole } from "../middleware/auth";
import * as studentService from "../services/studentService";
import { StudentProfileSchema, CertificationUploadSchema } from "@iti-portal/shared";
import { env } from "../config/env";

const router = Router();

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// Multer setup (memory storage, max 5MB)
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents (.doc, .docx) are allowed for resumes"));
    }
  }
});

const certUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' || 
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word documents, and image files are allowed for certifications"));
    }
  }
});

// All routes require student role
router.use(requireAuth, requireRole("student"));

// GET /students/me - Fetch own profile
router.get("/me", async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// PUT /students/me - Update profile
router.put("/me", async (req, res, next) => {
  try {
    const parsed = StudentProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    const profile = await studentService.updateStudentProfile(req.user!.userId, parsed.data);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// POST /students/me/resume - Upload or replace student resume
router.post("/me/resume", resumeUpload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    let resumeUrl = "";

    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "iti_resumes",
      });
      resumeUrl = result.secure_url;
    } else {
      console.warn("CLOUDINARY credentials not configured. Using local demonstration url.");
      resumeUrl = `https://res.cloudinary.com/demo/image/upload/v1312461204/resume_demo_${Date.now()}.pdf`;
    }

    const updatedProfile = await studentService.uploadResume(req.user!.userId, resumeUrl);
    res.json({ success: true, data: updatedProfile, message: "Resume uploaded successfully" });
  } catch (error) {
    console.error("Resume upload error:", error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message || "Failed to upload resume" });
  }
});

// DELETE /students/me/resume - Remove current resume
router.delete("/me/resume", async (req, res, next) => {
  try {
    const updatedProfile = await studentService.removeResume(req.user!.userId);
    res.json({ success: true, data: updatedProfile, message: "Resume removed successfully" });
  } catch (error) {
    console.error("Resume delete error:", error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message || "Failed to delete resume" });
  }
});

// GET /students/me/certifications
router.get("/me/certifications", async (req, res, next) => {
  try {
    const certs = await studentService.getStudentCertifications(req.user!.userId);
    res.json({ success: true, data: certs });
  } catch (error) {
    next(error);
  }
});

// POST /students/me/certifications
router.post("/me/certifications", certUpload.single("proofFile"), async (req, res, next) => {
  try {
    const parsed = CertificationUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let proofUrl = "";

    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      // Real upload
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "iti_certifications",
      });
      proofUrl = result.secure_url;
    } else {
      // TODO: Stub Cloudinary Upload
      console.warn("CLOUDINARY credentials not found. Stubbing upload.");
      proofUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; // fake url
    }

    const cert = await studentService.uploadCertification(req.user!.userId, parsed.data.title, proofUrl);
    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(400).json({ success: false, message: "Upload error" });
  }
});

// DELETE /students/me/certifications/:id
router.delete("/me/certifications/:id", async (req, res, next) => {
  try {
    await studentService.deleteCertification(req.user!.userId, req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(400).json({ success: false, message: "Error deleting" });
  }
});

// ─── Applications & Recommendations ───────────────────────────────────────────

router.get("/me/recommended-jobs", async (req, res, next) => {
  try {
    const jobs = await studentService.getRecommendedJobs(req.user!.userId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
});

import { ApplicationSchema } from "@iti-portal/shared";

router.post("/me/applications", async (req, res, next) => {
  try {
    const parsed = ApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    
    const app = await studentService.applyToJob(req.user!.userId, parsed.data.jobPostingId);
    res.status(201).json({ success: true, data: app });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

router.get("/me/applications", async (req, res, next) => {
  try {
    const apps = await studentService.getOwnApplications(req.user!.userId);
    res.json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
});

router.delete("/me/applications/:id", async (req, res, next) => {
  try {
    await studentService.withdrawApplication(req.user!.userId, req.params.id);
    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

export default router;
