import express from "express";
import { getUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

function scoreFixture(fixture) {
  let score = 20; // BASE SCORE – ΠΑΝΤΑ ΥΠΑΡΧΕΙ

  const league = fixture.league?.name?.toLowerCase() || "";
  const country = fixture.league?.country?.toLowerCase() || "";

  // League importance
  if (
    league.includes("premier") ||
    league.includes("la liga") ||
    league.includes("serie a") ||
    league.includes("bundesliga") ||
    league.includes("ligue")
  ) score += 20;

  if (
    country.includes("england") ||
    country.includes("spain") ||
    country.includes("italy") ||
    country.includes("germany") ||
    country.includes("france")
  ) score += 10;

  // Time proximity (soon matches more valuable)
  const matchTime = new Date(fixture.fixture.date).getTime();
  const now = Date.now();
  const hoursDiff = (matchTime - now) / 36e5;

  if (hoursDiff < 6) score += 15;
  else if (hoursDiff < 24) score += 10;
  else if (hoursDiff < 48) score += 5;

  return score;
}

router.post("/", async (req, res) => {
  try {
    const { mode, market } = req.body;

    if (mode !== "upcoming") {
      return res.json({ ok: false, error: "Unsupported mode" });
    }

    const fixtures = await getUpcomingFixtures(200);

    const analyzed = fixtures.map(f => {
      const score = scoreFixture(f);

      let value = "Low";
      if (score >= 60) value = "High";
      else if (score >= 40) value = "Medium";

      return {
        fixtureId: f.fixture.id,
        date: f.fixture.date,
        league: f.league.name,
        home: f.teams.home.name,
        away: f.teams.away.name,
        score,
        value
      };
    });

    res.json({
      ok: true,
      mode,
      market,
      fixturesCount: analyzed.length,
      fixtures: analyzed
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Analyze failed" });
  }
});

export default router;
