import express from "express";
import { analyzeMatch } from "../services/analyzeEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query, mode, market } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing match query" });
    }

    const result = await analyzeMatch({ query, mode, market });
    res.json(result);

  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
