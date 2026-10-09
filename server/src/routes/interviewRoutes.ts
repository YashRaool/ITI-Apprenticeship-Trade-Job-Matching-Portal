import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as interviewService from "../services/interviewService";
import { CreateInterviewSchema, UpdateInterviewStatusSchema } from "@iti-portal/shared";

const router = Router();

router.use(requireAuth);

// POST /interviews - Schedule an interview (Employer only)
router.post("/", async (req, res, next) => {
  try {
    const parsed = CreateInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map((e) => e.message) });
    }

    const interview = await interviewService.scheduleInterview(
      req.user!.userId,
      req.user!.role,
      parsed.data
    );
    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// GET /interviews/me - Get interviews for logged in student or employer
router.get("/me", async (req, res, next) => {
  try {
    const interviews = await interviewService.getUserInterviews(
      req.user!.userId,
      req.user!.role
    );
    res.json({ success: true, data: interviews });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// PATCH /interviews/:id - Update interview details (Employer only)
router.patch("/:id", async (req, res, next) => {
  try {
    const interview = await interviewService.updateInterview(
      req.user!.userId,
      req.user!.role,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: interview });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// PATCH /interviews/:id/status - Update interview status (CANCELLED / COMPLETED / SCHEDULED)
router.patch("/:id/status", async (req, res, next) => {
  try {
    const parsed = UpdateInterviewStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map((e) => e.message) });
    }

    const interview = await interviewService.updateInterviewStatus(
      req.user!.userId,
      req.user!.role,
      req.params.id,
      parsed.data.status
    );
    res.json({ success: true, data: interview });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

export default router;
