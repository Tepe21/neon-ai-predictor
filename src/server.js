import { addSubscription, sendPushToAll } from "./push.js";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.error("❌ API_FOOTBALL_KEY missing");
  process.exit(1);
}

const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: { "x-apisports-key": API_KEY },
});

/* =========================
   HEALTH
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   ANALYZE (από Βήμα 1)
========================= */
app.post("/api/analyze", async (req, res) => {
  try {
    const { mode = "live", market = "goals", time = "full" } = req.body;

    let fixtures = [];
    if (mode === "live") {
      const r = await api.get("/fixtures", { params: { live: "all" } });
      fixtures = r.data.response;
    } else {
      const today = new Date();
      const to = new Date(today);
      to.setDate(to.getDate() + 4);
      const r = await api.get("/fixtures", {
        params: {
          from: today.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
          status: "NS",
        },
      });
      fixtures = r.data.response;
    }

    const picks = fixtures.map((f) => {
      const minute = f.fixture.status.elapsed || 0;
      const goals =
        f.goals.home !== null ? f.goals.home + f.goals.away : 0;

      let confidence = 50;
      if (mode === "live") {
        if (minute >= 60) confidence += 10;
        if (goals === 0 && minute >= 65) confidence += 10;
        if (goals === 1 && minute >= 70) confidence += 5;
      } else {
        confidence += Math.floor(Math.random() * 20);
      }
      confidence = Math.min(confidence, 85);

      return {
        fixtureId: f.fixture.id,
        match: `${f.teams.home.name} - ${f.teams.away.name}`,
        minute,
        market,
        time,
        confidence,
      };
    });

    const results = picks
      .filter((p) => p.confidence >= 50)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   LIVE ALERTS ENGINE
========================= */

// in-memory store (free beta)
let liveAlerts = [];
const alertedFixtures = new Set();

// rules (απλές & σταθερές)
function shouldAlert(f) {
  const minute = f.fixture.status.elapsed || 0;
  const goals =
    f.goals.home !== null ? f.goals.home + f.goals.away : 0;

  // παράδειγμα value rule:
  // 65'–85', 0–1 goals → πιθανό late goal
  if (minute >= 65 && minute <= 85 && goals <= 1) return true;

  return false;
}

async function scanLiveForAlerts() {
  try {
    const r = await api.get("/fixtures", { params: { live: "all" } });
    const fixtures = r.data.response;

    fixtures.forEach((f) => {
      const id = f.fixture.id;
      if (alertedFixtures.has(id)) return;

      if (shouldAlert(f)) {
        const alert = {
          fixtureId: id,
          match: `${f.teams.home.name} - ${f.teams.away.name}`,
          minute: f.fixture.status.elapsed,
          score: `${f.goals.home}-${f.goals.away}`,
          tag: "LIVE VALUE",
          confidence: 70,
          createdAt: Date.now(),
        };

        liveAlerts.unshift(alert);
        alertedFixtures.add(id);

        // κρατάμε max 20 alerts
        liveAlerts = liveAlerts.slice(0, 20);
      }
    });
  } catch (e) {
    console.error("Live alert scan error:", e.message);
  }
}

await sendPushToAll({
  title: "🔥 Live Alert",
  body: `${newAlert.match} • ${newAlert.tag} • ${newAlert.confidence}%`
});

// scan κάθε 60''
setInterval(scanLiveForAlerts, 60 * 1000);

/* =========================
   LIVE ALERTS ENDPOINTS
========================= */
app.get("/api/live-alerts", (req, res) => {
  res.json({ alerts: liveAlerts });
});

app.post("/api/push/subscribe", (req, res) => {
  addSubscription(req.body);
  res.json({ success: true });
});

// debug endpoint για να δεις UI να ανάβει
app.get("/api/live-alerts/test", (req, res) => {
  const newAlert = {
    fixtureId: "TEST",
    match: "Test United - Demo FC",
    minute: 72,
    score: "0-0",
    tag: "LIVE VALUE",
    confidence: 78,
    createdAt: Date.now(),
  };
  liveAlerts.unshift(alert);
  liveAlerts = liveAlerts.slice(0, 20);
  res.json({ ok: true });
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
