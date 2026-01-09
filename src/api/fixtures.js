import express from "express";
import { getUpcomingFixtures } from "../utils/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const fixtures = await getUpcomingFixtures(200);

    res.json({
      count: fixtures.length,
      fixtures,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch upcoming fixtures" });
  }
});

export default router;
