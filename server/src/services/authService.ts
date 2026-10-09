import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authRepository } from "../repositories/authRepository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { env } from "../config/env";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

type TokenPair = { accessToken: string; refreshToken: string };

async function issueTokens(userId: string, role: string): Promise<TokenPair> {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });
  await authRepository.updateRefreshToken(userId, refreshToken);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(email: string, password: string, role: "student" | "employer") {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw Object.assign(new Error("Email already registered"), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authRepository.create({
      email,
      passwordHash,
      role: role as Role,
    });

    const tokens = await issueTokens(user.id, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    if (!user.isActive) {
      throw Object.assign(new Error("Account has been deactivated. Please contact support."), { status: 403 });
    }

    const tokens = await issueTokens(user.id, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  },

  async googleAuth(idToken: string) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw Object.assign(new Error("Google auth not configured"), { status: 501 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw Object.assign(new Error("Invalid Google token"), { status: 401 });
    }
    if (!payload.email_verified) {
      throw Object.assign(new Error("Google email is not verified"), { status: 401 });
    }

    // Find or create
    let user = await authRepository.findByGoogleId(payload.sub);
    if (!user) {
      user = await authRepository.findByEmail(payload.email) ?? null;
      if (user) {
        // Link Google ID to existing email account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub },
        });
      } else {
        user = await authRepository.create({
          email: payload.email,
          googleId: payload.sub,
          role: Role.student, // default — user can change in profile step
        });
      }
    }

    const tokens = await issueTokens(user.id, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  },

  async refresh(refreshToken: string) {
    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
    }

    const user = await authRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw Object.assign(new Error("Refresh token revoked"), { status: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error("Account has been deactivated"), { status: 403 });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    return { accessToken };
  },

  async logout(userId: string) {
    await authRepository.updateRefreshToken(userId, null);
  },
};
