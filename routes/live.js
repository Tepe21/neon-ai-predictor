import express from "express";

const router = express.Router();

const API_URL = "https://v3.football.api-sports.io/fixtures";

router.get("/live/matches", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}?live=all`, {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY
      }
    });

    const data = await response.json();

    if (!data.response) {
      return res.json([]);
    }

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

    res.json(matches);
  } catch (err) {
    console.error("LIVE MATCHES ERROR:", err.message);
    res.status(500).json({ error: "Live matches failed" });
  }
});

export default router;
