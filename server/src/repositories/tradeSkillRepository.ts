import { prisma } from "../lib/prisma";

export async function findAllTradeSkills() {
  return await prisma.tradeSkill.findMany({
    orderBy: { category: "asc" },
  });
}
