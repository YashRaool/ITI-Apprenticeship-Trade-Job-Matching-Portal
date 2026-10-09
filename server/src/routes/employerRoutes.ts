import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import * as employerService from "../services/employerService";
import { EmployerProfileSchema, JobPostingSchema, JobPostingUpdateSchema } from "@iti-portal/shared";

const router = Router();

router.use(requireAuth, requireRole("employer"));

// ─── Employer Profile ─────────────────────────────────────────────────────────

router.get("/me", async (req, res, next) => {
  try {
    const profile = await employerService.getEmployerProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.put("/me", async (req, res, next) => {
  try {
    const parsed = EmployerProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    const profile = await employerService.upsertEmployerProfile(req.user!.userId, parsed.data);
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// ─── Job Postings ─────────────────────────────────────────────────────────────

router.get("/me/jobs", async (req, res, next) => {
  try {
    const jobs = await employerService.getOwnJobs(req.user!.userId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/me/jobs", async (req, res, next) => {
  try {
    const parsed = JobPostingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    const job = await employerService.createJob(req.user!.userId, parsed.data);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

router.get("/me/jobs/:id", async (req, res, next) => {
  try {
    const job = await employerService.getOwnJob(req.user!.userId, req.params.id);
    res.json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

router.put("/me/jobs/:id", async (req, res, next) => {
  try {
    const parsed = JobPostingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    const job = await employerService.updateJob(req.user!.userId, req.params.id, parsed.data);
    res.json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/me/jobs/:id", async (req, res, next) => {
  try {
    await employerService.deleteJob(req.user!.userId, req.params.id);
    res.json({ success: true, message: "Job posting deleted" });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// ─── Applicant Management ─────────────────────────────────────────────────────

import { ApplicationStatusUpdateSchema } from "@iti-portal/shared";

router.get("/me/jobs/:id/applications", async (req, res, next) => {
  try {
    const applications = await employerService.getJobApplicants(req.user!.userId, req.params.id);
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

router.put("/me/jobs/:id/applications/:applicationId", async (req, res, next) => {
  try {
    const parsed = ApplicationStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map(e => e.message) });
    }
    
    const app = await employerService.updateApplicantStatus(
      req.user!.userId,
      req.params.id,
      req.params.applicationId,
      parsed.data.status
    );
    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

export default router;
