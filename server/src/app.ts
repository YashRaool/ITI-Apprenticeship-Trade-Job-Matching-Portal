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
import contactRoutes from "./routes/contactRoutes";

const app = express();

// Trust reverse proxy (ALB / Nginx in Elastic Beanstalk)
app.set("trust proxy", 1);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// Support comma-separated origins and strip trailing slashes to avoid CORS rejection
const rawOrigins = env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalized) || env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 1000 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
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
app.use("/contact", contactRoutes);

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
