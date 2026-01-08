import express from "express";
import { apiFootballGet } from "../utils/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const from = today.toISOString().split("T")[0];

    const toDate = new Date();
    toDate.setDate(today.getDate() + 7);
    const to = toDate.toISOString().split("T")[0];

    const data = await apiFootballGet("/fixtures", {
      from,
      to,
      timezone: "Europe/Athens"
    });

    const fixtures = data?.response || [];

    res.json({
      count: fixtures.length,
      fixtures
    });

  } catch (err) {
    console.error("❌ Upcoming fixtures error:", err.message);
    res.status(500).json({ error: "Failed to fetch upcoming fixtures" });
  }
});

export default router;
