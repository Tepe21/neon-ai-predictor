import express from "express";
import { apiFootballGet } from "../utils/apiFootball.js";

const router = express.Router();

// helper: YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// GET /api/fixtures/upcoming
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const to = new Date();
    to.setDate(today.getDate() + 4); // επόμενες 4 μέρες

    const fromDate = formatDate(today);
    const toDate = formatDate(to);

    const data = await apiFootballGet("/fixtures", {
      from: fromDate,
      to: toDate,
      timezone: "Europe/Athens"
    });

    const fixtures = data?.response || [];

    res.json({
      count: fixtures.length,
      fixtures
    });

  } catch (err) {
    console.error("Upcoming fixtures error:", err.message);
    res.status(500).json({
      error: "Failed to fetch upcoming fixtures"
    });
  }
});

export default router;
