import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// 🔑 API-Football DIRECT key (όχι RapidAPI)
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// ---- LIVE MATCHES WITH ODDS (65+ only) ----
app.get("/api/live-matches", async (req, res) => {
  try {
    // 1️⃣ Live fixtures
    const fixturesRes = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    const results = [];

    for (const f of fixtures) {
      const minute = f.fixture.status.elapsed;
      if (!minute || minute < 65) continue; // ⛔ μόνο 65+

      const fixtureId = f.fixture.id;

      // 2️⃣ Odds για το συγκεκριμένο fixture
      const oddsRes = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}`, {
        headers: {
          "x-apisports-key": API_KEY
        }
      });

      const oddsData = await oddsRes.json();
      const bookmakers = oddsData.response?.[0]?.bookmakers || [];

      // ψάχνουμε Over Goals market
      let overMarket = null;

      for (const b of bookmakers) {
        for (const bet of b.bets) {
          if (bet.name.toLowerCase().includes("over")) {
            overMarket = bet.values;
            break;
          }
        }
        if (overMarket) break;
      }

      results.push({
        fixtureId,
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute,
        score: `${f.goals.home}-${f.goals.away}`,
        odds: overMarket || []
      });
    }

    res.json(results);

  } catch (err) {
    console.error("LIVE MATCH ERROR:", err);
    res.status(500).json({ error: "Live matches fetch failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
