import { Router } from "express";
import { calculateMetrics } from "../controllers/metricsTestController";

const router = Router();

router.post("/metrics/test", calculateMetrics);

export default router;
