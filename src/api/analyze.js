import express from "express";
import { getUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mode = "upcoming", market = "goals" } = req.body;

  try {
    if (mode !== "upcoming") {
      return res.json({ ok: false, message: "Only upcoming supported" });
    }

    const fixtures = await getUpcomingFixtures(50);

    res.json({
      ok: true,
      mode,
      market,
      fixturesCount: fixtures.length,
      fixtures,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
