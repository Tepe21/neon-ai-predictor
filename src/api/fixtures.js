import express from "express";
import { getUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const fixtures = await getUpcomingFixtures(200);
    res.json({
      count: fixtures.length,
      fixtures
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

export default router;
