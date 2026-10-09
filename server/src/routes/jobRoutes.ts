import { Router } from "express";
import * as jobService from "../services/jobService";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { tradeSkillId, location, search, jobType, page, limit } = req.query;
    
    const result = await jobService.getActiveJobs({
      tradeSkillId: tradeSkillId as string,
      location: location as string,
      search: search as string,
      jobType: jobType as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await jobService.getActiveJobById(req.params.id);
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

export default router;
