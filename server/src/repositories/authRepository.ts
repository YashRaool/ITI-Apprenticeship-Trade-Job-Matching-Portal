import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  findByGoogleId: (googleId: string) =>
    prisma.user.findUnique({ where: { googleId } }),

  create: (data: { email: string; passwordHash?: string; googleId?: string; role: Role }) =>
    prisma.user.create({ data }),

  updateRefreshToken: (id: string, refreshToken: string | null) =>
    prisma.user.update({ where: { id }, data: { refreshToken } }),
};
