import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ====== SERVE FRONTEND ======
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// ====== BASIC HEALTH CHECK ======
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running" });
});

// ====== API FOOTBALL CONFIG ======
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = "v3.football.api-sports.io";

// helper fetch
async function apiFetch(url) {
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY,
      "x-rapidapi-host": API_HOST
    }
  });
  return await res.json();
}

// ====== UPCOMING FIXTURES ======
app.get("/api/fixtures/upcoming", async (req, res) => {
  try {
    const next = req.query.next || 200;
    const url = `https://${API_HOST}/fixtures?next=${next}`;
    const data = await apiFetch(url);
    res.json(data.response || []);
  } catch (err) {
    console.error("Upcoming fixtures error:", err);
    res.status(500).json({ error: "Failed to load upcoming fixtures" });
  }
});

// ====== LIVE FIXTURES ======
app.get("/api/fixtures/live", async (req, res) => {
  try {
    const url = `https://${API_HOST}/fixtures?live=all`;
    const data = await apiFetch(url);
    res.json(data.response || []);
  } catch (err) {
    console.error("Live fixtures error:", err);
    res.status(500).json({ error: "Failed to load live fixtures" });
  }
});

// ====== ANALYZE ENDPOINT ======
app.post("/api/analyze", async (req, res) => {
  try {
    const { mode, market, time } = req.body;

    // For now return simple mock analysis
    // (Later we plug probability engines)

    const result = {
      mode,
      market,
      time,
      suggestion: market === "goals" ? "Over 1.5" : "Over 4.5",
      confidence: Math.floor(50 + Math.random() * 40),
      tag: "Normal"
    };

    res.json({ results: [result] });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("AI Football Picks backend running on port " + PORT);
});
