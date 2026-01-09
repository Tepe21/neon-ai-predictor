import express from "express";
import { getUpcomingFixtures } from "./fixtures.js";
import { runManualEngine } from "../engines/manualEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mode, market, time = "full" } = req.body;

  if (mode !== "upcoming") {
    return res.json({
      ok: false,
      error: "Only upcoming mode supported"
    });
  }

  const fixtures = await getUpcomingFixtures(200);

  const suggestions = runManualEngine({
    fixtures,
    market,
    time
  });

  res.json({
    ok: true,
    mode,
    market,
    time,
    fixturesUsed: fixtures.length,
    suggestions
  });
});

export default router;
