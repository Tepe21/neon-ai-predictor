import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

/* ---------------- HELPERS ---------------- */

// Normalize greek / english input
function normalize(text) {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/VS|-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Fuzzy score
function scoreMatch(query, home, away) {
  const q = normalize(query);
  const h = normalize(home);
  const a = normalize(away);

  let score = 0;
  if (q.includes(h)) score++;
  if (q.includes(a)) score++;
  if (h.includes(q)) score++;
  if (a.includes(q)) score++;

  return score;
}

/* ---------------- ROUTE ---------------- */

router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    const type = req.query.type || "upcoming";

    if (!q) return res.json([]);

    const today = new Date();
    const from = today.toISOString().split("T")[0];

    const toDate = new Date();
    toDate.setDate(today.getDate() + 7);
    const to = toDate.toISOString().split("T")[0];

    const endpoint =
      type === "live"
        ? `${API_URL}/fixtures?live=all`
        : `${API_URL}/fixtures?from=${from}&to=${to}`;

    const response = await fetch(endpoint, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    const data = await response.json();

    if (!data.response) return res.json([]);

    const matches = data.response
      .map((f) => {
        const home = f.teams.home.name;
        const away = f.teams.away.name;
        const matchScore = scoreMatch(q, home, away);

        return {
          fixtureId: f.fixture.id,
          home,
          away,
          league: f.league.name,
          country: f.league.country,
          date: f.fixture.date,
          status: f.fixture.status.short,
          minute: f.fixture.status.elapsed,
          score: `${f.goals.home ?? 0}-${f.goals.away ?? 0}`,
          matchScore,
        };
      })
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json([]);
  }
});

export default router;
