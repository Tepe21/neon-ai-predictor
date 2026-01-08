// src/api/analyze.js
import express from "express";
import { getUpcomingFixtures } from "./fixtures.js";

const router = express.Router();

/**
 * POST /api/analyze
 * body: { mode: "upcoming" | "live", market: "goals" | "corners" }
 */
router.post("/", async (req, res) => {
  try {
    const { mode, market } = req.body || {};

    if (!mode || !market) {
      return res.status(400).json({
        ok: false,
        error: "mode and market are required"
      });
    }

    // ---- UPCOMING ----
    if (mode === "upcoming") {
      const { fixtures } = await getUpcomingFixtures({
        daysAhead: 4 // όπως συμφωνήσαμε
      });

      return res.json({
        ok: true,
        mode,
        market,
        fixturesCount: fixtures.length,
        fixtures
      });
    }

    // ---- LIVE (placeholder – ΔΕΝ το σπάμε τώρα) ----
    if (mode === "live") {
      return res.json({
        ok: true,
        mode,
        market,
        fixturesCount: 0,
        fixtures: []
      });
    }

    return res.status(400).json({
      ok: false,
      error: "Invalid mode"
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({
      ok: false,
      error: "Analyze failed"
    });
  }
});

export default router;
