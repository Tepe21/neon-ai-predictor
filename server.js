import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiKeyLoaded: !!API_KEY });
});

/* =========================
   LIVE FIXTURES (ALL)
========================= */
app.get("/api/test-live", async (req, res) => {
  try {
    const r = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPCOMING (NEXT 4 DAYS)
========================= */
app.get("/api/test-upcoming", async (req, res) => {
  try {
    const today = new Date();
    const from = today.toISOString().split("T")[0];

    const toDate = new Date();
    toDate.setDate(today.getDate() + 4);
    const to = toDate.toISOString().split("T")[0];

    const r = await fetch(
      `${BASE_URL}/fixtures?from=${from}&to=${to}`,
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
