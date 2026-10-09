// Placeholder — queue definitions go here in Phase 2+
// BullMQ workers will be added per-feature (e.g., email, notification queues)
import { Queue } from "bullmq";
import { getRedis } from "./redis";

let emailQueue: Queue | null = null;

export function getEmailQueue(): Queue {
  if (!emailQueue) {
    emailQueue = new Queue("email", {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return emailQueue;
}
