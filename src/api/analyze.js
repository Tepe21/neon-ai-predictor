import express from "express";
import { getUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

function scoreFixture(f) {
  let score = 20;

  const league = f.league?.name?.toLowerCase() || "";
  if (
    league.includes("premier") ||
    league.includes("la liga") ||
    league.includes("serie") ||
    league.includes("bundesliga") ||
    league.includes("ligue")
  ) score += 25;

  const matchTime = new Date(f.fixture.date).getTime();
  const hours = (matchTime - Date.now()) / 36e5;

  if (hours < 6) score += 20;
  else if (hours < 24) score += 10;

  return score;
}

router.post("/", async (req, res) => {
  try {
    const fixtures = await getUpcomingFixtures(200);

    const analyzed = fixtures.map(f => {
      const score = scoreFixture(f);
      return {
        fixtureId: f.fixture.id,
        home: f.teams.home.name,
        away: f.teams.away.name,
        league: f.league.name,
        date: f.fixture.date,
        score,
        value:
          score >= 60 ? "High" :
          score >= 40 ? "Medium" :
          "Low"
      };
    });

    res.json({
      ok: true,
      fixturesCount: analyzed.length,
      fixtures: analyzed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

export default router;
