import express from "express";
import { getUpcomingFixtures, getLiveFixtures } from "../utils/apiFootball.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mode, market, time } = req.body;

  try {
    let fixtures = [];

    if (mode === "upcoming") {
      fixtures = await getUpcomingFixtures(200);
    }

    if (mode === "live") {
      fixtures = await getLiveFixtures();
    }

    // ⬇️ εδώ μπαίνει αργότερα scoring / AI logic
    res.json({
      ok: true,
      mode,
      market,
      time,
      fixturesCount: fixtures.length,
      fixtures,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Analyze failed" });
  }
});

export default router;
