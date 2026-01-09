import express from "express";
import { getUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const fixtures = await getUpcomingFixtures(limit);

    res.json({
      count: fixtures.length,
      fixtures,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
