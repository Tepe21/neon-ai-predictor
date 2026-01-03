router.get("/live-raw", async (req, res) => {
  const url = "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all";

  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": process.env.API_FOOTBALL_KEY,
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com"
    }
  });

  const data = await response.json();
  res.json(data);
});
