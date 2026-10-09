import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authService } from "../services/authService";
import { authRepository } from "../repositories/authRepository";
import { requireAuth } from "../middleware/auth";
import { env } from "../config/env";

const router = Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Lenient rate limit for session endpoints
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 2000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// ─── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "employer"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({ idToken: z.string().min(1) });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cookieSameSite = (env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || (env.NODE_ENV === "production" ? "none" : "lax");
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production" || cookieSameSite === "none",
  sameSite: cookieSameSite,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, COOKIE_OPTS);
}

function handleError(err: unknown, res: Response) {
  const e = err as Error & { status?: number };
  return res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Server error" });
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/register", authLimiter, async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const { user, accessToken, refreshToken } = await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.role
    );
    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return handleError(err, res);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      parsed.data.email,
      parsed.data.password
    );
    setRefreshCookie(res, refreshToken);
    return res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return handleError(err, res);
  }
});

// ─── POST /auth/google ────────────────────────────────────────────────────────
router.post("/google", authLimiter, async (req: Request, res: Response) => {
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
  }
  try {
    const { user, accessToken, refreshToken } = await authService.googleAuth(parsed.data.idToken);
    setRefreshCookie(res, refreshToken);
    return res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return handleError(err, res);
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
router.post("/refresh", sessionLimiter, async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token" });
  try {
    const { accessToken } = await authService.refresh(token);
    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return handleError(err, res);
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    await authService.logout(req.user!.userId);
    res.clearCookie("refreshToken", { path: "/" });
    return res.json({ success: true, message: "Logged out" });
  } catch (err) {
    return handleError(err, res);
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", sessionLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authRepository.findById(req.user!.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return handleError(err, res);
  }
});

export default router;
