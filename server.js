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

/* ---------- LIVE ALERTS (AUTO) ---------- */
app.get("/api/live-alerts", async (req, res) => {
  try {
    const fxRes = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const fxData = await fxRes.json();
    const fixtures = fxData.response || [];

    const alerts = [];

    for (const f of fixtures) {
      const minute = f.fixture.status.elapsed;
      if (!minute || minute < 65) continue;

      const oddsRes = await fetch(`${BASE_URL}/odds?fixture=${f.fixture.id}`, {
        headers: { "x-apisports-key": API_KEY }
      });
      const oddsData = await oddsRes.json();
      const books = oddsData.response?.[0]?.bookmakers || [];

      let goalOdds = [], cornerOdds = [];
      for (const b of books) {
        for (const bet of b.bets) {
          if (bet.name.toLowerCase().includes("goal")) goalOdds = bet.values;
          if (bet.name.toLowerCase().includes("corner")) cornerOdds = bet.values;
        }
      }

      const score = `${f.goals.home}-${f.goals.away}`;

      if (goalOdds.length) {
        const r = calculateGoalProbability({ minute, score, odds: goalOdds });
        if (r) {
          const a = {
            type: "goal",
            match: `${f.teams.home.name} – ${f.teams.away.name}`,
            minute, score, market: r.market, odd: r.odd,
            confidence: r.confidence, level: r.level
          };
          alerts.push(a);
          await sendAlertOnce(a);
        }
      }

      if (cornerOdds.length) {
        const r = calculateCornerProbability({
          minute,
          corners: {
            home: f.statistics?.[0]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0,
            away: f.statistics?.[1]?.statistics?.find(s => s.type === "Corner Kicks")?.value || 0
          },
          odds: cornerOdds
        });
        if (r) {
          const a = {
            type: "corner",
            match: `${f.teams.home.name} – ${f.teams.away.name}`,
            minute, score, market: r.market, odd: r.odd,
            confidence: r.confidence, level: r.level
          };
          alerts.push(a);
          await sendAlertOnce(a);
        }
      }
    }
    res.json(alerts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Live alerts failed" });
  }
});

/* ---------- SEARCH (LIVE + UPCOMING) ---------- */
app.post("/api/search", async (req, res) => {
  try {
    const { mode, market, fixtureId } = req.body;
    if (!mode || !market || !fixtureId) {
      return res.status(400).json({ error: "Invalid search payload" });
    }

    // fixture
    const fxRes = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const fxData = await fxRes.json();
    const f = fxData.response?.[0];
    if (!f) return res.json(null);

    // odds
    const oddsRes = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const oddsData = await oddsRes.json();
    const books = oddsData.response?.[0]?.bookmakers || [];

    let odds = [];
    for (const b of books) {
      for (const bet of b.bets) {
        if (market === "goals" && bet.name.toLowerCase().includes("goal")) odds = bet.values;
        if (market === "corners" && bet.name.toLowerCase().includes("corner")) odds = bet.values;
      }
    }
    if (!odds.length) return res.json(null);

    const minute = mode === "live" ? f.fixture.status.elapsed : null;
    const score = `${f.goals.home}-${f.goals.away}`;

    let result = null;

    if (market === "goals") {
      result = calculateGoalProbability({
        minute: mode === "live" ? minute : 70, // pre-match neutral
        score,
        odds
      });
    } else {
      result = calculateCornerProbability({
        minute: mode === "live" ? minute : 70,
        corners: { home: 0, away: 0 },
        odds
      });
    }

    if (!result) return res.json(null);

    res.json({
      type: market,
      match: `${f.teams.home.name} – ${f.teams.away.name}`,
      mode,
      market: result.market,
      odd: result.odd,
      confidence: result.confidence,
      level: result.level
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
