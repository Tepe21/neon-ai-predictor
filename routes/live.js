import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/*
  API-Football (RapidAPI)
  Χρησιμοποιούμε TEST MODE / LIVE fixtures
*/

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = "api-football-v1.p.rapidapi.com";

// 👉 LIVE MATCHES
router.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": API_HOST,
        },
      }
    );

    const data = await response.json();

    if (!data || !data.response) {
      return res.json([]);
    }

    // 🔥 Κρατάμε μόνο χρήσιμα fields
    const matches = data.response.map((m) => ({
      id: m.fixture.id,
      league: m.league.name,
      country: m.league.country,
      minute: m.fixture.status.elapsed,
      home: m.teams.home.name,
      away: m.teams.away.name,
      goals: {
        home: m.goals.home,
        away: m.goals.away,
      },
      status: m.fixture.status.short,
    }));

    res.json(matches);
  } catch (err) {
    console.error("LIVE API ERROR:", err.message);
    res.status(500).json({ error: "Live API failed" });
  }
});

export default router;
