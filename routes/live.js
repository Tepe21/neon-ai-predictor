import express from "express";

const router = express.Router();

router.get("/live-raw", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      {
        headers: {
          "X-RapidAPI-Key": process.env.API_FOOTBALL_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("LIVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
