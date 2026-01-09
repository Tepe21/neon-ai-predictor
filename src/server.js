import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ===============================
   HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "AI Football Picks backend is running" });
});

/* ===============================
   UPCOMING FIXTURES (GLOBAL – FIXED)
   API-Football recommended way
================================ */
app.get("/api/fixtures/upcoming", async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: {
          next: 50,
          timezone: "Europe/Athens"
        },
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY
        }
      }
    );

    res.json({
      fixtures: response.data.response || []
    });
  } catch (error) {
    console.error("UPCOMING FIXTURES ERROR:", error.message);
    res.status(500).json({ fixtures: [] });
  }
});

/* ===============================
   ANALYZE ENDPOINT (LIVE / UPCOMING)
================================ */
app.post("/api/analyze", async (req, res) => {
  const { mode, market } = req.body;

  if (!mode || !market) {
    return res.status(400).json({
      ok: false,
      error: "Missing mode or market"
    });
  }

  try {
    let fixtures = [];

    if (mode === "upcoming") {
      const response = await axios.get(
        "https://v3.football.api-sports.io/fixtures",
        {
          params: {
            next: 50,
            timezone: "Europe/Athens"
          },
          headers: {
            "x-apisports-key": process.env.API_FOOTBALL_KEY
          }
        }
      );

      fixtures = response.data.response || [];
    }

    if (mode === "live") {
      const response = await axios.get(
        "https://v3.football.api-sports.io/fixtures",
        {
          params: {
            live: "all"
          },
          headers: {
            "x-apisports-key": process.env.API_FOOTBALL_KEY
          }
        }
      );

      fixtures = response.data.response || [];
    }

    res.json({
      ok: true,
      mode,
      market,
      fixturesCount: fixtures.length,
      fixtures
    });
  } catch (error) {
    console.error("ANALYZE ERROR:", error.message);
    res.status(500).json({
      ok: false,
      error: "Analyze failed"
    });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
