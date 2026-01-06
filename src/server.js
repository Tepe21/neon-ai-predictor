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

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "AI Football Picks" });
});

/* ================= ANALYZE ENGINE ================= */
app.post("/api/analyze", async (req, res) => {
  const { query, mode, market } = req.body;

  if (!query) return res.json({ results: [] });

  try {
    // 1️⃣ Fetch fixtures (live or upcoming)
    const endpoint =
      mode === "live"
        ? `${BASE}/fixtures?live=all`
        : `${BASE}/fixtures?next=50`;

    const fixturesRes = await fetch(endpoint, {
      headers: { "x-apisports-key": API_KEY }
    });

    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    // 2️⃣ Fuzzy match teams
    const matches = fixtures.filter(f =>
      `${f.teams.home.name} ${f.teams.away.name}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (matches.length === 0) {
      return res.json({ results: [] });
    }

    // 3️⃣ Pick first match (dropdown later handled in UI)
    const match = matches[0];

    const minute = match.fixture.status.elapsed || 0;

    // 4️⃣ Fetch odds
    const oddsRes = await fetch(
      `${BASE}/odds?fixture=${match.fixture.id}`,
      { headers: { "x-apisports-key": API_KEY } }
    );
    const oddsData = await oddsRes.json();

    const odds =
      oddsData.response?.[0]?.bookmakers?.[0]?.bets || [];

    // 5️⃣ Simple confidence logic (beta)
    let confidence = 65;
    if (mode === "live" && minute >= 65) confidence += 8;
    if (market === "goals") confidence += 4;
    if (confidence > 85) confidence = 85;

    return res.json({
      results: [
        {
          match: `${match.teams.home.name} – ${match.teams.away.name}`,
          minute,
          tip:
            market === "goals"
              ? "Over 1.5 Goals"
              : "Over 8.5 Corners",
          odd:
            market === "goals"
              ? "1.70"
              : "1.85",
          confidence
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analyze engine failed" });
  }
});

/* ================= LIVE ALERTS ENGINE (BASE) ================= */
app.get("/api/live-alerts", async (req, res) => {
  try {
    const liveRes = await fetch(`${BASE}/fixtures?live=all`, {
      headers: { "x-apisports-key": API_KEY }
    });

    const data = await liveRes.json();
    const fixtures = data.response || [];

    const alerts = fixtures
      .filter(f => f.fixture.status.elapsed >= 65)
      .slice(0, 5)
      .map(f => ({
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute: f.fixture.status.elapsed,
        market: "GOAL",
        tag: "High Value",
        confidence: 72
      }));

    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: "Live alerts failed" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("✅ AI Football Picks backend running on port", PORT);
});
