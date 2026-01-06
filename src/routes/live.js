import express from "express";
import { calculateGoalProbability } from "../services/goalProbability.js";

const router = express.Router();

const API_URL = "https://v3.football.api-sports.io/fixtures";

// =====================================
// 🔴 LIVE MATCHES + GOAL PROBABILITY
// Endpoint: GET /api/live/matches
// =====================================
router.get("/live/matches", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}?live=all`, {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY
      }
    });

    const data = await response.json();

    if (!data || !data.response) {
      return res.json([]);
    }

    // 🔹 Βασικά δεδομένα αγώνα
    const matches = data.response.map((m) => ({
      id: m.fixture.id,
      league: m.league.name,
      country: m.league.country,
      minute: m.fixture.status.elapsed,
      home: m.teams.home.name,
      away: m.teams.away.name,
      score: `${m.goals.home}-${m.goals.away}`,
      status: m.fixture.status.short
    }));

    // 🧠 Goal Probability Engine (65’–80’)
    const analyzed = matches
      .map((match) => {
        const analysis = calculateGoalProbability(match);
        if (!analysis) return null;

        return {
          ...match,
          confidence: analysis.confidence,
          tag: analysis.tag
        };
      })
      .filter(Boolean);

    res.json(analyzed);
  } catch (err) {
    console.error("LIVE MATCHES ERROR:", err.message);
    res.status(500).json({ error: "Live matches failed" });
  }
});

export default router;
