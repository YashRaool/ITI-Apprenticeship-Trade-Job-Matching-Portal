import { Router, Request, Response } from "express";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  role: z.enum(["trainee", "employer", "other"]).default("other"),
  message: z.string().min(1, "Message is required").max(2000),
});

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.errors[0]?.message || "Invalid contact form payload",
      errors: result.error.errors,
    });
  }

  return res.status(501).json({
    success: false,
    message: "Automated email dispatch service is not currently configured on the server. Please send inquiries directly to yashhraool9@gmail.com.",
  });
});

export default router;
