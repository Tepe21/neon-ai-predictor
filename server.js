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

/* ---------- HELPERS ---------- */
const normalize = (s="") =>
  s.toLowerCase()
   .replace(/[άα]/g,"α").replace(/[έε]/g,"ε")
   .replace(/[ήη]/g,"η").replace(/[ίι]/g,"ι")
   .replace(/[όο]/g,"ο").replace(/[ύυ]/g,"υ")
   .replace(/[ώω]/g,"ω")
   .replace(/vs|-/g," ")
   .replace(/\s+/g," ")
   .trim();

/* ---------- PUSH SUBSCRIBE ---------- */
app.post("/api/subscribe", (req, res) => {
  addSubscription(req.body);
  res.json({ success: true });
});

/* ---------- LIVE ALERTS (AUTO) ---------- */
app.get("/api/live-alerts", async (req, res) => {
  try {
    const r = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const data = await r.json();
    const fixtures = data.response || [];
    const alerts = [];

    for (const f of fixtures) {
      const minute = f.fixture.status.elapsed;
      if (!minute || minute < 65) continue;

      const oddsR = await fetch(`${BASE_URL}/odds?fixture=${f.fixture.id}`, {
        headers: { "x-apisports-key": API_KEY }
      });
      const oddsD = await oddsR.json();
      const books = oddsD.response?.[0]?.bookmakers || [];

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
            type:"goal", match:`${f.teams.home.name} – ${f.teams.away.name}`,
            minute, score, market:r.market, odd:r.odd,
            confidence:r.confidence, level:r.level
          };
          alerts.push(a);
          await sendAlertOnce(a);
        }
      }

      if (cornerOdds.length) {
        const r = calculateCornerProbability({
          minute,
          corners:{home:0,away:0},
          odds:cornerOdds
        });
        if (r) {
          const a = {
            type:"corner", match:`${f.teams.home.name} – ${f.teams.away.name}`,
            minute, score, market:r.market, odd:r.odd,
            confidence:r.confidence, level:r.level
          };
          alerts.push(a);
          await sendAlertOnce(a);
        }
      }
    }
    res.json(alerts);
  } catch {
    res.status(500).json({ error:"Live alerts failed" });
  }
});

/* ---------- SEARCH (FREE TEXT + DROPDOWN) ---------- */
app.post("/api/search", async (req, res) => {
  try {
    const { query, mode, market } = req.body;
    if (!query) return res.json({ matches: [] });

    const days = mode === "upcoming" ? 2 : 0;
    const url = days
      ? `${BASE_URL}/fixtures?next=50`
      : `${BASE_URL}/fixtures?live=all`;

    const r = await fetch(url, {
      headers: { "x-apisports-key": API_KEY }
    });
    const data = await r.json();
    const fixtures = data.response || [];

    const q = normalize(query);

    const matches = fixtures.filter(f => {
      const name = normalize(`${f.teams.home.name} ${f.teams.away.name}`);
      return q.split(" ").every(w => name.includes(w));
    });

    if (matches.length > 1) {
      return res.json({
        multiple: true,
        options: matches.map(f => ({
          id: f.fixture.id,
          label: `${f.teams.home.name} – ${f.teams.away.name}`
        }))
      });
    }

    if (!matches.length) return res.json({ matches: [] });

    const f = matches[0];

    const oddsR = await fetch(`${BASE_URL}/odds?fixture=${f.fixture.id}`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const oddsD = await oddsR.json();
    const books = oddsD.response?.[0]?.bookmakers || [];

    let odds = [];
    for (const b of books) {
      for (const bet of b.bets) {
        if (market==="goals" && bet.name.toLowerCase().includes("goal")) odds=bet.values;
        if (market==="corners" && bet.name.toLowerCase().includes("corner")) odds=bet.values;
      }
    }

    if (!odds.length) return res.json({ matches: [] });

    const minute = mode==="live" ? f.fixture.status.elapsed : 70;
    const score = `${f.goals.home}-${f.goals.away}`;

    const r2 = market==="goals"
      ? calculateGoalProbability({ minute, score, odds })
      : calculateCornerProbability({ minute, corners:{home:0,away:0}, odds });

    if (!r2) return res.json({ matches: [] });

    if (mode==="upcoming") r2.level="pre";

    res.json({
      match:`${f.teams.home.name} – ${f.teams.away.name}`,
      mode,
      market:r2.market,
      odd:r2.odd,
      confidence:r2.confidence,
      level:r2.level
    });
  } catch {
    res.status(500).json({ error:"Search failed" });
  }
});

app.listen(process.env.PORT || 3000);
