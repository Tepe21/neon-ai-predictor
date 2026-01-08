// src/api/fixtures.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

/**
 * Internal helper (χρησιμοποιείται και από analyze)
 */
export async function getUpcomingFixtures({ daysAhead = 4 }) {
  const today = new Date();
  const toDate = new Date();
  toDate.setDate(today.getDate() + daysAhead);

  const from = today.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);

  const url = `${API_BASE}/fixtures?from=${from}&to=${to}&status=NS`;

  const r = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await r.json();

  const fixtures = Array.isArray(data?.response)
    ? data.response
    : [];

  return { fixtures };
}

/**
 * GET /api/fixtures/upcoming
 */
router.get("/upcoming", async (req, res) => {
  try {
    const { fixtures } = await getUpcomingFixtures({ daysAhead: 4 });

    res.json({
      count: fixtures.length,
      fixtures
    });
  } catch (err) {
    console.error("Upcoming fixtures error:", err);
    res.status(500).json({
      count: 0,
      fixtures: []
    });
  }
});

export default router;
