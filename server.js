import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = "api-football-v1.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": API_KEY,
  "x-rapidapi-host": API_HOST
};

// ---- LIVE MATCHES WITH ODDS ----
app.get("/api/live-matches", async (req, res) => {
  try {
    // 1️⃣ Live fixtures
    const fixturesRes = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      { headers }
    );
    const fixturesData = await fixturesRes.json();

    const fixtures = fixturesData.response || [];

    const results = [];

    for (const f of fixtures) {
      const minute = f.fixture.status.elapsed;
      if (minute < 65) continue; // ⛔ μόνο 65+

      const fixtureId = f.fixture.id;

      // 2️⃣ Odds για κάθε fixture
      const oddsRes = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/odds?fixture=${fixtureId}`,
        { headers }
      );
      const oddsData = await oddsRes.json();

      const bookmakers = oddsData.response?.[0]?.bookmakers || [];

      // βρίσκουμε market Over Goals (παράδειγμα)
      let overMarket = null;

      for (const b of bookmakers) {
        for (const bet of b.bets) {
          if (bet.name.includes("Over")) {
            overMarket = bet;
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
        odds: overMarket ? overMarket.values : [],
      });
    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Live matches fetch failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
