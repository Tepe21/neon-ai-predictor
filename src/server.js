import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { addSubscription, sendPushToAll } from "./push.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: { "x-apisports-key": API_KEY }
});

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= ANALYZE ================= */
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
          status: "NS"
        }
      });
      fixtures = r.data.response;
    }

    const results = fixtures.map(f => {
      const minute = f.fixture.status.elapsed || 0;
      let confidence = 50;
      if (minute >= 60) confidence += 10;
      if (minute >= 70) confidence += 10;

      return {
        match: `${f.teams.home.name} - ${f.teams.away.name}`,
        market,
        time,
        confidence: Math.min(confidence, 85)
      };
    }).slice(0, 2);

    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: "Analyze failed" });
  }
});

/* ================= LIVE ALERTS ================= */
let liveAlerts = [];
const alerted = new Set();

function shouldAlert(f) {
  const minute = f.fixture.status.elapsed || 0;
  const goals = (f.goals.home || 0) + (f.goals.away || 0);
  return minute >= 65 && minute <= 85 && goals <= 1;
}

/* 🔴 ΕΔΩ Η ΚΡΙΣΙΜΗ ΔΙΟΡΘΩΣΗ */
async function scanLiveForAlerts() {
  try {
    const r = await api.get("/fixtures", { params: { live: "all" } });

    for (const f of r.data.response) {
      if (alerted.has(f.fixture.id)) continue;
      if (!shouldAlert(f)) continue;

      const alertObj = {
        match: `${f.teams.home.name} - ${f.teams.away.name}`,
        minute: f.fixture.status.elapsed,
        confidence: 70,
        tag: "LIVE VALUE"
      };

      alerted.add(f.fixture.id);
      liveAlerts.unshift(alertObj);
      liveAlerts = liveAlerts.slice(0, 20);

      await sendPushToAll({
        title: "🔥 Live Alert",
        body: `${alertObj.match} • ${alertObj.tag} • ${alertObj.confidence}%`
      });
    }
  } catch (e) {
    console.error("Live scan error:", e.message);
  }
}

setInterval(scanLiveForAlerts, 60 * 1000);

app.get("/api/live-alerts", (req, res) => {
  res.json({ alerts: liveAlerts });
});

/* ================= PUSH ================= */
app.post("/api/push/subscribe", (req, res) => {
  addSubscription(req.body);
  res.json({ success: true });
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log("🚀 AI Football Picks backend running");
});
