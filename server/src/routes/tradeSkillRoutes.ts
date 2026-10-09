import { Router } from "express";
import * as tradeSkillService from "../services/tradeSkillService";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const grouped = await tradeSkillService.getGroupedTradeSkills();
    res.json({ success: true, data: grouped });
  } catch (error) {
    next(error);
  }
});

export default router;
