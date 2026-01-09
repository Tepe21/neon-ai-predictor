import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// HEALTH CHECK
// =====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// =====================
// LIVE FIXTURES
// =====================
app.get("/api/fixtures/live", async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: {
          live: "all",
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
  } catch (err) {
    console.error("LIVE FIXTURES ERROR:", err.message);
    res.status(500).json({ fixtures: [] });
  }
});

// =====================
// UPCOMING FIXTURES (CORRECT WAY)
// =====================
app.get("/api/fixtures/upcoming", async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: {
          next: 50,
          status: "NS",
          season: 2025,
          league: "39,140,135,78",
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
  } catch (err) {
    console.error("UPCOMING FIXTURES ERROR:", err.message);
    res.status(500).json({ fixtures: [] });
  }
});

// =====================
// PLACEHOLDER ANALYZE (ΔΕΝ ΤΟ ΠΕΙΡΑΖΟΥΜΕ ΤΩΡΑ)
// =====================
app.post("/api/analyze", (req, res) => {
  res.json({
    results: [],
    message: "Analyze engine will be connected next"
  });
});

// =====================
// ROOT
// =====================
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
