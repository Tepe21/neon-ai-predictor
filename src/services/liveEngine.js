import fetch from "node-fetch";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

export async function getLiveAlerts() {
  const today = new Date().toISOString().split("T")[0];

  const res = await fetch(`${BASE_URL}/fixtures?date=${today}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();

  if (!data.response || !Array.isArray(data.response)) {
    return [];
  }

  const alerts = [];

  for (const f of data.response) {
    const status = f.fixture.status.short;
    const minute = f.fixture.status.elapsed ?? 0;

    // LIVE STATUSES
    if (!["1H", "2H", "LIVE", "ET"].includes(status)) continue;

    const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);

    // BASIC ENGINE RULE (demo)
    if (minute >= 65 && minute <= 85 && goals < 3) {
      alerts.push({
        match: `${f.teams.home.name} – ${f.teams.away.name}`,
        minute,
        market: "Over 0.5 Goals",
        odd: "1.80",
        confidence: Math.min(65 + Math.floor(minute / 2), 90),
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
