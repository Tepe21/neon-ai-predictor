// src/api/fixtures.js
import express from "express";
import { apiGet } from "../utils/apiFootball.js";

const router = express.Router();

/**
 * GET /api/fixtures/upcoming
 * Επιστρέφει upcoming αγώνες (NS)
 */
router.get("/upcoming", async (req, res) => {
  try {
    const fixtures = await apiGet("/fixtures", {
      status: "NS",
      next: 50
    });

    res.json({
      count: fixtures.length,
      fixtures: fixtures.map(f => ({
        id: f.fixture.id,
        date: f.fixture.date,
        league: f.league.name,
        home: f.teams.home.name,
        away: f.teams.away.name
      }))
    });
  } catch (err) {
    console.error("Upcoming fixtures error:", err.message);
    res.status(500).json({ error: "Failed to load upcoming fixtures" });
  }
});

export default router;
