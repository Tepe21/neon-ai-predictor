import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

// =====================
// HEALTH CHECK
// =====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// =====================
// BASIC TEST
// =====================
app.get("/api/test", (req, res) => {
  res.json({ status: "AI Football Picks backend is running" });
});

// =====================
// 🔥 TEST LIVE FIXTURES
// =====================
app.get("/api/test-live", async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: { live: "all" },
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    res.json({
      results: response.data.response.length,
      matches: response.data.response.map(f => ({
        fixtureId: f.fixture.id,
        league: f.league.name,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
        minute: f.fixture.status.elapsed,
        score: `${f.goals.home}-${f.goals.away}`,
      })),
    });
  } catch (err) {
    res.status(500).json({
      error: "API-Football error",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
