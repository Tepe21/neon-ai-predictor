import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

/* ------------------ helpers ------------------ */

// remove accents + uppercase
function normalize(str) {
  return str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/VS|-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// simple fuzzy score
function scoreMatch(query, home, away) {
  const q = normalize(query);
  const h = normalize(home);
  const a = normalize(away);

  let score = 0;
  if (q.includes(h)) score += 1;
  if (q.includes(a)) score += 1;
  if (h.includes(q)) score += 1;
  if (a.includes(q)) score += 1;

  return score;
}

/* ------------------ route ------------------ */

router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    const type = req.query.type || "upcoming"; // upcoming | live

    if (!q) {
      return res.json([]);
    }

    const today = new Date();
    const from = today.toISOString().split("T")[0];

    const toDate = new Date();
    toDate.setDate(today.getDate() + 7);
    const to = toDate.toISOString().split("T")[0];

    const url =
      type === "live"
        ? `${API_URL}/fixtures?live=all`
        : `${API_URL}/fixtures?from=${from}&to=${to}`;

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    const data = await response.json();

    if (!data.response) {
      return res.json([]);
    }

    const results = data.response
      .map((f) => {
        const home = f.teams.home.name;
        const away = f.teams.away.name;
        const matchScore = scoreMatch(q, home, away);

        return {
          fixtureId: f.fixture.id,
          league: f.league.name,
          country: f.league.country,
          date: f.fixture.date,
          status: f.fixture.status.short,
          minute: f.fixture.status.elapsed,
          home,
          away,
          score: `${f.goals.home ?? 0}-${f.goals.away ?? 0}`,
          matchScore,
        };
      })
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(results);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json([]);
  }
});

export default router;
