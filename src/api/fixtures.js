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
    const r = await fetch(
      `${API_URL}/fixtures?status=NS&next=200`,
      { headers }
    );
    const j = await r.json();

    res.json({
      count: j.response.length,
      fixtures: j.response
    });
  } catch (e) {
    res.status(500).json({ error: "Upcoming fixtures failed" });
  }
});

export default router;
