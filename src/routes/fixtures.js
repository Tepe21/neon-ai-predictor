import express from "express";
import { fetchUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const fixtures = await fetchUpcomingFixtures(200);
    res.json({
      count: fixtures.length,
      fixtures,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
