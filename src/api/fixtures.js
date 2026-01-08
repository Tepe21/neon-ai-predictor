import express from "express";
import { apiFootball } from "../utils/apiFootball.js";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  try {
    const data = await apiFootball("/fixtures", {
      status: "NS",
      next: 100,
    });

    res.json({
      count: data.response.length,
      fixtures: data.response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch upcoming fixtures" });
  }
});

export default router;
