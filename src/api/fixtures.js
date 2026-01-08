import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = "https://v3.football.api-sports.io";

const headers = {
  "x-apisports-key": API_KEY
};

// LIVE FIXTURES
router.get("/live", async (req, res) => {
  try {
    const r = await fetch(`${API_URL}/fixtures?live=all`, { headers });
    const j = await r.json();

    res.json({
      count: j.response.length,
      fixtures: j.response
    });
  } catch (e) {
    res.status(500).json({ error: "Live fixtures failed" });
  }
});

// UPCOMING FIXTURES (GLOBAL STABLE)
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const from = today.toISOString().split("T")[0];

    const toDate = new Date();
    toDate.setDate(today.getDate() + 4);
    const to = toDate.toISOString().split("T")[0];

    const r = await fetch(
      `${API_URL}/fixtures?from=${from}&to=${to}`,
      { headers }
    );
    const j = await r.json();

    res.json({
      count: j.response.length,
      fixtures: j.response
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Upcoming fixtures failed" });
  }
});

export default router;
