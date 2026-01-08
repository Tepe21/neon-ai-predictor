router.get("/", (req, res) => {
  res.json({ status: "analyze route alive" });
});

import express from "express";
import { apiFootball } from "../utils/apiFootball.js";

const router = express.Router();

function confidence(base, variance = 10) {
  return Math.min(
    95,
    Math.max(50, Math.round(base + (Math.random() * variance - variance / 2)))
  );
}

router.post("/", async (req, res) => {
  const { mode = "upcoming", market = "goals" } = req.body;

  if (mode !== "upcoming") {
    return res.json({ results: [] });
  }

  try {
    const data = await apiFootball("/fixtures", {
      status: "NS",
      next: 100,
    });

    const fixtures = data.response.slice(0, 4); // 4 days approx

    const results = fixtures.slice(0, 2).map((f) => ({
      fixtureId: f.fixture.id,
      match: `${f.teams.home.name} - ${f.teams.away.name}`,
      league: f.league.name,
      market,
      prediction:
        market === "corners"
          ? "Over 8.5 Corners"
          : "Over 2.5 Goals",
      confidence:
        market === "corners"
          ? confidence(62)
          : confidence(65),
      kickoff: f.fixture.date,
    }));

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
