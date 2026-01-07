import express from "express";
import { apiGet } from "../services/apiFootball.js";

const router = express.Router();

/**
 * LIVE FIXTURES
 * GET /api/fixtures/live
 */
router.get("/live", async (req, res) => {
  try {
    const fixtures = await apiGet("/fixtures", { live: "all" });
    res.json({ count: fixtures.length, fixtures });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPCOMING FIXTURES (today + 4 days)
 * GET /api/fixtures/upcoming
 */
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const to = new Date();
    to.setDate(today.getDate() + 4);

    const fromStr = today.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);

    const fixtures = await apiGet("/fixtures", {
      from: fromStr,
      to: toStr,
    });

    res.json({ count: fixtures.length, fixtures });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
