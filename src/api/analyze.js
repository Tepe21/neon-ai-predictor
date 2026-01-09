import express from "express";
import { apiFetch } from "../services/apiFootball.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      market = "goals",
      league,
      country,
      fromHour,
      toHour
    } = req.body;

    let fixtures = await apiFetch("/fixtures", {
      next: 200,
      status: "NS"
    });

    // 🔍 FILTERS
    if (league) {
      fixtures = fixtures.filter(f => f.league?.name === league);
    }

    if (country) {
      fixtures = fixtures.filter(f => f.league?.country === country);
    }

    if (fromHour !== undefined) {
      fixtures = fixtures.filter(f => {
        const h = new Date(f.fixture.date).getHours();
        return h >= fromHour;
      });
    }

    if (toHour !== undefined) {
      fixtures = fixtures.filter(f => {
        const h = new Date(f.fixture.date).getHours();
        return h <= toHour;
      });
    }

    res.json({
      ok: true,
      market,
      fixturesCount: fixtures.length,
      fixtures
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
