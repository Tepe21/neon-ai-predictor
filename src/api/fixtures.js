import express from "express";
import { apiGet } from "../utils/apiFootball.js";

const router = express.Router();

/**
 * LIVE fixtures
 */
router.get("/live", async (req, res) => {
  try {
    const fixtures = await apiGet("/fixtures", {
      live: "all",
      timezone: "Europe/Athens"
    });

    res.json({
      count: fixtures.length,
      fixtures
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPCOMING fixtures (ΣΤΑΘΕΡΟ – GLOBAL)
 * Χρησιμοποιούμε status=NS
 */
router.get("/upcoming", async (req, res) => {
  try {
    const fixtures = await apiGet("/fixtures", {
      status: "NS",
      season: 2025,
      timezone: "Europe/Athens",
      limit: 500
    });

    res.json({
      count: fixtures.length,
      fixtures
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
