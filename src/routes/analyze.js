import express from "express";
import { fetchUpcomingFixtures } from "../services/apiFootball.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mode, market } = req.body;

  if (mode !== "upcoming") {
    return res.status(400).json({ error: "Only upcoming supported" });
  }

  const fixtures = await fetchUpcomingFixtures(200);

  res.json({
    ok: true,
    mode,
    market,
    fixturesCount: fixtures.length,
    fixtures,
  });
});

export default router;
