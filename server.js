import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { calculateGoalProbability } from "./services/goalProbability.js";
import { calculateCornerProbability } from "./services/cornerProbability.js";
import { addSubscription, sendAlertOnce } from "./services/pushService.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

/* ---------- PUSH SUBSCRIBE ---------- */
app.post("/api/subscribe", (req, res) => {
  addSubscription(req.body);
  res.json({ success: true });
});

/* ---------- LIVE ALERTS (GOALS + CORNERS) ---------- */
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
      const score = `${f.goals.home}-${f.goals.away}`;

      /* ---- ODDS ---- */
      const oddsRes = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}`, {
        headers: { "x-apisports-key": API_KEY }
      });
      const oddsData = await oddsRes.json();
      const bookmakers = oddsData.response?.[0]?.bookmakers || [];

      /* ---- GOALS ODDS ---- */
      let goalOdds = [];
      /* ---- CORNERS ODDS ---- */
      let cornerOdds = [];

      for (const b of bookmakers) {
        for (const bet of b.bets) {
          if (bet.name.toLowerCase().includes("goal")) {
            goalOdds = bet.values;
          }
          if (bet.name.toLowerCase().includes("corner")) {
            cornerOdds = bet.values;
          }
        }
      }

      /* ---------- GOAL ENGINE ---------- */
      if (goalOdds.length) {
        const goalResult = calculateGoalProbability({
          minute,
          score,
          odds: goalOdds
        });

        if (goalResult) {
          const alert = {
            type: "goal",
            match: `${f.teams.home.name} – ${f.teams.away.name}`,
            minute,
            score,
            market: goalResult.market,
            odd: goalResult.odd,
            confidence: goalResult.confidence,
            level: goalResult.level
          };

          alerts.push(alert);
          await sendAlertOnce(alert);
        }
      }

      /* ---------- CORNER ENGINE ---------- */
      if (cornerOdds.length) {
        const cornerResult = calculateCornerProbability({
          minute,
          corners: {
            home: f.statistics?.[0]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0,
            away: f.statistics?.[1]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0
          },
          odds: cornerOdds
        });

        if (cornerResult) {
          const alert = {
            type: "corner",
            match: `${f.teams.home.name} – ${f.teams.away.name}`,
            minute,
            score,
            market: cornerResult.market,
            odd: cornerResult.odd,
            confidence: cornerResult.confidence,
            level: cornerResult.level
          };

          alerts.push(alert);
          await sendAlertOnce(alert);
        }
      }
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
