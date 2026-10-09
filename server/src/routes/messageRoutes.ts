import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as messageService from "../services/messageService";
import { CreateConversationSchema, SendMessageSchema } from "@iti-portal/shared";

const router = Router();

router.use(requireAuth);

// POST /messages/conversations - Get or create conversation
router.post("/conversations", async (req, res, next) => {
  try {
    const { jobId, studentId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    const conversation = await messageService.getOrCreateConversation(
      req.user!.userId,
      req.user!.role,
      jobId,
      studentId
    );
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// GET /messages/conversations - List conversations for current user
router.get("/conversations", async (req, res, next) => {
  try {
    const conversations = await messageService.getUserConversations(
      req.user!.userId,
      req.user!.role
    );
    res.json({ success: true, data: conversations });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// GET /messages/conversations/:conversationId - Get single conversation details & messages
router.get("/conversations/:conversationId", async (req, res, next) => {
  try {
    const conversation = await messageService.getConversationDetails(
      req.user!.userId,
      req.user!.role,
      req.params.conversationId
    );
    res.json({ success: true, data: conversation });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// POST /messages/conversations/:conversationId/messages - Send message
router.post("/conversations/:conversationId/messages", async (req, res, next) => {
  try {
    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors.map((e) => e.message) });
    }

    const message = await messageService.sendMessage(
      req.user!.userId,
      req.user!.role,
      req.params.conversationId,
      parsed.data.content
    );
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

// PATCH /messages/conversations/:conversationId/read - Mark messages as read
router.patch("/conversations/:conversationId/read", async (req, res, next) => {
  try {
    const result = await messageService.markConversationRead(
      req.user!.userId,
      req.user!.role,
      req.params.conversationId
    );
    res.json(result);
  } catch (error) {
    const status = (error as any).status ?? 500;
    res.status(status).json({ success: false, message: (error as Error).message });
  }
});

export default router;
