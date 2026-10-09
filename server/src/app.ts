import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import tradeSkillRoutes from "./routes/tradeSkillRoutes";
import adminRoutes from "./routes/adminRoutes";
import employerRoutes from "./routes/employerRoutes";
import jobRoutes from "./routes/jobRoutes";
import messageRoutes from "./routes/messageRoutes";
import interviewRoutes from "./routes/interviewRoutes";

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 100 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/trade-skills", tradeSkillRoutes);
app.use("/admin", adminRoutes);
app.use("/employers", employerRoutes);
app.use("/jobs", jobRoutes);
app.use("/messages", messageRoutes);
app.use("/interviews", interviewRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
