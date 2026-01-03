import express from "express";

const router = express.Router();

router.get("/live-raw", async (req, res) => {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY
        }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("LIVE API ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
