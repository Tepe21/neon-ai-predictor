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
  headers: {
    "x-apisports-key": API_KEY,
  },
});

/* ------------------ BASIC HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------ TEST LIVE (DEBUG) ------------------ */
app.get("/api/test-live", async (req, res) => {
  try {
    const r = await api.get("/fixtures", {
      params: { live: "all" },
    });
    res.json(r.data.response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------------ TEST UPCOMING (DEBUG) ------------------ */
app.get("/api/test-upcoming", async (req, res) => {
  try {
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

    res.json(r.data.response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------------ ANALYZE ENGINE ------------------ */
app.post("/api/analyze", async (req, res) => {
  try {
    const {
      mode = "live",       // live | upcoming
      market = "goals",    // goals | corners
      time = "full",       // half | full
    } = req.body;

    let fixtures = [];

    if (mode === "live") {
      const r = await api.get("/fixtures", {
        params: { live: "all" },
      });
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

    if (!fixtures.length) {
      return res.json({ results: [] });
    }

    /* -------- SIMPLE CONFIDENCE ENGINE (STABLE) -------- */
    const picks = fixtures.map((f) => {
      const minute = f.fixture.status.elapsed || 0;
      const goals =
        f.goals.home !== null
          ? f.goals.home + f.goals.away
          : 0;

      let confidence = 50;

      if (mode === "live") {
        if (minute >= 60) confidence += 10;
        if (goals === 0 && minute >= 65) confidence += 10;
        if (goals === 1 && minute >= 70) confidence += 5;
      } else {
        confidence += Math.floor(Math.random() * 20); // pre-match variance
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

    const filtered = picks
      .filter((p) => p.confidence >= 50)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    res.json({ results: filtered });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/* ------------------ ROOT ------------------ */
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
