// ─── Server Entry Point ───────────────────────────────────────────────────────
import "dotenv/config";
import app from "./app";
import { connectRedis } from "./lib/redis";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT ?? 5000;

async function bootstrap() {
  try {
    try {
      await prisma.$connect();
      console.log("✅ PostgreSQL connected via Prisma");
    } catch (dbErr) {
      console.warn("⚠️  PostgreSQL connection failed, continuing without DB:", (dbErr as Error).message);
    }

    try {
      await connectRedis();
    } catch (redisErr) {
      console.warn("⚠️  Redis connection failed, continuing without Redis:", (redisErr as Error).message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

bootstrap();
