import fetch from "node-fetch";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

export async function getLiveAlerts() {
  const res = await fetch(`${BASE_URL}/fixtures?live=all`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();
  if (!data.response) return [];

  const alerts = [];

  for (const f of data.response) {
    const minute = f.fixture.status.elapsed;
    const goals =
      f.goals.home + f.goals.away;

    // βασικό φίλτρο (θα βελτιωθεί)
    if (minute >=1) {
      alerts.push({
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute,
        market: "Over 0.5 Goals",
        odd: "1.80", // προσωρινό (θα μπει odds engine μετά)
        confidence: Math.min(60 + minute / 2, 90),
        level:
          minute >= 75
            ? "bomb"
            : minute >= 70
            ? "high"
            : "normal"
      });
    }
  }

  return alerts;
}
