import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { calculateGoalProbability } from "./services/goalProbability.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API-Football (direct)
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// ---- LIVE ALERTS WITH ENGINE ----
app.get("/api/live-alerts", async (req, res) => {
  try {
    const fixturesRes = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { "x-apisports-key": API_KEY }
    });

    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    const alerts = [];

    for (const f of fixtures) {
      const minute = f.fixture.status.elapsed;
      if (!minute || minute < 65) continue;

      const fixtureId = f.fixture.id;

      const oddsRes = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}`, {
        headers: { "x-apisports-key": API_KEY }
      });

      const oddsData = await oddsRes.json();
      const bookmakers = oddsData.response?.[0]?.bookmakers || [];

      let odds = [];

      for (const b of bookmakers) {
        for (const bet of b.bets) {
          if (bet.name.toLowerCase().includes("over")) {
            odds = bet.values;
            break;
          }
        }
        if (odds.length) break;
      }

      if (!odds.length) continue;

      const score = `${f.goals.home}-${f.goals.away}`;

      const result = calculateGoalProbability({
        minute,
        score,
        odds
      });

      if (!result) continue;

      alerts.push({
        type: "goal",
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute,
        score,
        market: result.market,
        odd: result.odd,
        confidence: result.confidence,
        level: result.level
      });
    }

    res.json(alerts);

  } catch (err) {
    console.error("LIVE ALERTS ERROR:", err);
    res.status(500).json({ error: "Live alerts engine failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
