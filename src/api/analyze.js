import express from "express";

const router = express.Router();

/**
 * DEBUG – για να ξέρουμε ότι το route φορτώνεται
 */
router.get("/", (req, res) => {
  res.json({ status: "analyze route alive" });
});

/**
 * POST /api/analyze
 */
router.post("/", async (req, res) => {
  try {
    const { mode = "upcoming", market = "goals" } = req.body;

    // προσωρινό dummy response για να σταθεροποιήσουμε το endpoint
    res.json({
      ok: true,
      mode,
      market,
      results: [],
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
