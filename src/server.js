import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==============================
// CONFIG
// ==============================
const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.error("❌ API_FOOTBALL_KEY missing");
}

// ==============================
// BASIC ROUTES
// ==============================
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/test", (req, res) => {
  res.json({ ok: true, file: "src/server.js" });
});

// ==============================
// API FOOTBALL HELPER
// ==============================
async function apiGet(endpoint, params = {}) {
  const response = await axios.get(`${API_URL}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY
    },
    params
  });
  return response.data.response || [];
}

// ==============================
// LIVE FIXTURES
// ==============================
app.get("/api/live", async (req, res) => {
  try {
    const fixtures = await apiGet("/fixtures", {
      live: "all"
    });

    res.json({ results: fixtures });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Live fetch failed" });
  }
});

// ==============================
// UPCOMING FIXTURES (next 4 days)
// ==============================
app.get("/api/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const to = new Date();
    to.setDate(today.getDate() + 4);

    const fromDate = today.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);

    const fixtures = await apiGet("/fixtures", {
      from: fromDate,
      to: toDate
    });

    res.json({ results: fixtures });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Upcoming fetch failed" });
  }
});

// ==============================
// ANALYZE (LIVE + UPCOMING)
// ==============================
app.post("/api/analyze", async (req, res) => {
  try {
    const { mode, market, time } = req.body;

    let fixtures = [];

    if (mode === "live") {
      fixtures = await apiGet("/fixtures", { live: "all" });
    } else {
      const today = new Date();
      const to = new Date();
      to.setDate(today.getDate() + 4);

      fixtures = await apiGet("/fixtures", {
        from: today.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10)
      });
    }

    // SIMPLE ENGINE (safe & deterministic)
    const results = fixtures.map(f => {
      const minute = f.fixture?.status?.elapsed || 0;

      let confidence = Math.min(
        90,
        50 +
          minute * 0.3 +
          Math.random() * 10
      );

      return {
        fixtureId: f.fixture.id,
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute,
        market,
        time,
        confidence: Math.round(confidence)
      };
    });

    res.json({ results });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analyze failed" });
  }
});

// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
