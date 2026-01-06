import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE = "https://v3.football.api-sports.io";

if (!API_KEY) {
  console.error("❌ API_FOOTBALL_KEY missing");
}

/* ================== HEALTH ================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================== UTIL ================== */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zα-ω0-9\s]/gi, "")
    .trim();
}

function confidenceTag(conf, isUpcoming) {
  if (isUpcoming) {
    if (conf >= 65) return "High Value";
    return "Normal";
  }
  if (conf >= 80) return "Bomb";
  if (conf >= 65) return "High Value";
  return "Normal";
}

/* ================== ANALYZE ================== */
app.post("/api/analyze", async (req, res) => {
  const { query, mode, market, time } = req.body;
  if (!query) return res.json({ results: [] });

  try {
    let fixtures = [];

    /* ===== UPCOMING: NEXT 4 DAYS ===== */
    if (mode === "upcoming") {
      const today = new Date();
      const to = new Date();
      to.setDate(today.getDate() + 4);

      const fromStr = today.toISOString().split("T")[0];
      const toStr = to.toISOString().split("T")[0];

      const r = await fetch(
        `${BASE}/fixtures?from=${fromStr}&to=${toStr}`,
        { headers: { "x-apisports-key": API_KEY } }
      );
      const d = await r.json();
      fixtures = d.response || [];
    }

    /* ===== LIVE ===== */
    if (mode === "live") {
      const r = await fetch(`${BASE}/fixtures?live=all`, {
        headers: { "x-apisports-key": API_KEY }
      });
      const d = await r.json();
      fixtures = d.response || [];
    }

    /* ===== FILTER MATCH ===== */
    const q = normalize(query);
    const matches = fixtures.filter(f => {
      const name = normalize(
        `${f.teams.home.name} ${f.teams.away.name}`
      );
      return name.includes(q);
    });

    if (matches.length === 0) {
      return res.json({ results: [] });
    }

    const selected = matches.slice(0, 2); // 🔒 always 2

    /* ===== BUILD RESULTS ===== */
    const results = [];

    for (const m of selected) {
      const minute = m.fixture.status.elapsed || 0;

      let confidence = 50;

      if (mode === "live") {
        if (minute >= 45) confidence += 5;
        if (minute >= 60) confidence += 5;
      }

      if (market === "goals") confidence += 5;
      if (time === "full") confidence += 3;

      if (confidence > 85) confidence = 85;
      if (mode === "upcoming" && confidence > 80) confidence = 80;

      results.push({
        match: `${m.teams.home.name} – ${m.teams.away.name}`,
        minute: mode === "live" ? minute : null,
        market: market,
        time: time === "half" ? "Half Time" : "Full Time",
        tip:
          market === "goals"
            ? time === "half"
              ? "Over 0.5"
              : "Over 2.5"
            : time === "half"
            ? "Over 4.5"
            : "Over 8.5",
        odd:
          market === "goals"
            ? time === "half"
              ? "1.55"
              : "1.95"
            : time === "half"
            ? "1.65"
            : "1.85",
        confidence,
        tag: confidenceTag(confidence, mode === "upcoming")
      });
    }

    res.json({ results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

/* ================== START ================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("✅ AI Football Picks backend running on port", PORT);
});
