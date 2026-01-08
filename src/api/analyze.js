import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// test
router.get("/", (req, res) => {
  res.json({ status: "analyze route alive" });
});

router.post("/", async (req, res) => {
  try {
    const { mode = "upcoming", market = "goals" } = req.body;

    const baseUrl = "https://neon-ai-predictor.onrender.com";

    const endpoint =
      mode === "live"
        ? "/api/fixtures/live"
        : "/api/fixtures/upcoming";

    const response = await fetch(baseUrl + endpoint);
    const data = await response.json();

    res.json({
      ok: true,
      mode,
      market,
      fixturesCount: data.fixtures?.length || 0,
      fixtures: data.fixtures || []
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
