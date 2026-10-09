import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { updateSetting, getSettingValue, SETTINGS_KEYS } from "../services/settingsService";
import * as adminService from "../services/adminService";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireRole("admin"));

// ─── GET /admin/settings ──────────────────────────────────────────────────────
router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const maxTradeSkills = await getSettingValue(SETTINGS_KEYS.MAX_TRADE_SKILLS);
    return res.json({
      success: true,
      data: { [SETTINGS_KEYS.MAX_TRADE_SKILLS]: Number(maxTradeSkills) },
    });
  } catch (err) {
    console.error("GET /admin/settings error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /admin/settings ───────────────────────────────────────────────────
const updateSettingsSchema = z.object({
  maxTradeSkillsPerStudent: z.number().int().min(1).max(20).optional(),
});

router.patch("/settings", async (req: Request, res: Response) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const updates = parsed.data;
    if (updates.maxTradeSkillsPerStudent !== undefined) {
      await updateSetting(SETTINGS_KEYS.MAX_TRADE_SKILLS, String(updates.maxTradeSkillsPerStudent));
    }
    return res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    console.error("PATCH /admin/settings error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /admin/analytics ─────────────────────────────────────────────────────
router.get("/analytics", async (_req: Request, res: Response) => {
  try {
    const data = await adminService.getAnalytics();
    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET /admin/analytics error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get("/users", async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const role   = req.query.role   as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminService.listUsers({ role, search, page, limit });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /admin/users/:id/status ───────────────────────────────────────────
const userStatusSchema = z.object({ isActive: z.boolean() });

router.patch("/users/:id/status", async (req: Request, res: Response) => {
  const parsed = userStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const user = await adminService.setUserStatus(req.params.id, parsed.data.isActive);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    console.error("PATCH /admin/users/:id/status error:", err);
    return res.status(err.status ?? 500).json({ success: false, message: err.message ?? "Internal server error" });
  }
});

// ─── GET /admin/employers ─────────────────────────────────────────────────────
// Full paginated list of all employers (pending/verified/rejected)
router.get("/employers", async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const verificationStatus = req.query.verificationStatus as string | undefined;
    const search             = req.query.search             as string | undefined;

    const result = await adminService.listAllEmployers({ verificationStatus, search, page, limit });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("GET /admin/employers error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /admin/employers/pending ────────────────────────────────────────────
// Kept for backwards compatibility
router.get("/employers/pending", async (_req: Request, res: Response) => {
  try {
    const data = await adminService.listPendingEmployers();
    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET /admin/employers/pending error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /admin/employers/:id/verify ───────────────────────────────────────
const verifySchema = z.object({ verified: z.boolean() });

router.patch("/employers/:id/verify", async (req: Request, res: Response) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const data = await adminService.verifyEmployer(req.params.id, parsed.data.verified);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("PATCH /admin/employers/:id/verify error:", err);
    return res.status(err.status ?? 500).json({ success: false, message: err.message ?? "Internal server error" });
  }
});

// ─── GET /admin/jobs ──────────────────────────────────────────────────────────
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status  = req.query.status  as string | undefined;
    const flagged = req.query.flagged !== undefined ? req.query.flagged === "true" : undefined;

    const result = await adminService.listAllJobs({ status, flagged, page, limit });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("GET /admin/jobs error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /admin/jobs/:id/moderate ─────────────────────────────────────────
// Soft-removes a job from the platform. flaggedFraudulent=true + moderatedAt set.
// Applications are preserved. Job hidden from all student-facing flows.
const moderateSchema = z.object({ reason: z.string().max(500).optional() });

router.patch("/jobs/:id/moderate", async (req: Request, res: Response) => {
  const parsed = moderateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const data = await adminService.moderateJob(req.params.id, parsed.data.reason);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("PATCH /admin/jobs/:id/moderate error:", err);
    return res.status(err.status ?? 500).json({ success: false, message: err.message ?? "Internal server error" });
  }
});

// ─── PATCH /admin/jobs/:id/restore ───────────────────────────────────────────
// Restores a moderated job — clears flaggedFraudulent, moderatedAt, moderationReason.
router.patch("/jobs/:id/restore", async (req: Request, res: Response) => {
  try {
    const data = await adminService.restoreJob(req.params.id);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("PATCH /admin/jobs/:id/restore error:", err);
    return res.status(err.status ?? 500).json({ success: false, message: err.message ?? "Internal server error" });
  }
});

// ─── GET /admin/messages/conversations ────────────────────────────────────────
router.get("/messages/conversations", async (req: Request, res: Response) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const filter = req.query.filter as "all" | "recent" | "unread" | undefined;

    const result = await adminService.listAdminConversations({ search, filter, page, limit });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("GET /admin/messages/conversations error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /admin/messages/conversations/:conversationId ───────────────────────
router.get("/messages/conversations/:conversationId", async (req: Request, res: Response) => {
  try {
    const data = await adminService.getAdminConversationDetails(req.params.conversationId);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /admin/messages/conversations/:conversationId error:", err);
    return res.status(err.status ?? 500).json({ success: false, message: err.message ?? "Internal server error" });
  }
});

export default router;

