import express from "express";
import { getUpcomingFixtures } from "../utils/apiFootball.js";

const router = express.Router();

/* ===============================
   SCORING ENGINE
================================ */

function scoreFixture(fixture, market) {
  let score = 0;

  const stats = fixture.statistics || {};
  const home = stats.home || {};
  const away = stats.away || {};

  if (market === "goals") {
    if ((home.goals_avg || 0) + (away.goals_avg || 0) >= 2.6) score += 30;
    if ((home.over25 || 0) >= 60) score += 20;
    if ((away.over25 || 0) >= 60) score += 20;
    if ((home.btts || 0) >= 55) score += 15;
    if ((away.btts || 0) >= 55) score += 15;
  }

  if (market === "corners") {
    if ((home.corners_avg || 0) + (away.corners_avg || 0) >= 9) score += 30;
    if ((home.corners_for || 0) >= 5) score += 20;
    if ((away.corners_for || 0) >= 5) score += 20;
  }

  return score;
}

function rankFixtures(fixtures, market) {
  return fixtures
    .map(f => ({
      ...f,
      score: scoreFixture(f, market)
    }))
    .filter(f => f.score >= 40)
    .sort((a, b) => b.score - a.score);
}

/* ===============================
   ANALYZE ENDPOINT
================================ */

router.post("/", async (req, res) => {
  try {
    const { mode = "upcoming", market = "goals" } = req.body;

    if (mode !== "upcoming") {
      return res.json({
        ok: true,
        fixturesCount: 0,
        fixtures: []
      });
    }

    const fixtures = await getUpcomingFixtures(200);
    const ranked = rankFixtures(fixtures, market);

    return res.json({
      ok: true,
      mode,
      market,
      fixturesCount: ranked.length,
      fixtures: ranked
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
