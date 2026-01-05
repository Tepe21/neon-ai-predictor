import fetch from "node-fetch";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

export async function getLiveAlerts() {
  console.log("⚡ Fetching live fixtures...");

  const res = await fetch(`${BASE_URL}/fixtures?live=all`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();

  console.log("📦 RAW API RESPONSE:", JSON.stringify(data, null, 2));

  if (!data.response || !Array.isArray(data.response)) {
    console.log("❌ No response array from API");
    return [];
  }

  const alerts = [];

  for (const f of data.response) {
    const minute = f.fixture?.status?.elapsed ?? 0;
    const goals = (f.goals?.home ?? 0) + (f.goals?.away ?? 0);

    alerts.push({
      match: `${f.teams.home.name} – ${f.teams.away.name}`,
      minute,
      market: "Over 0.5 Goals",
      odd: "1.80",
      confidence: 75,
      level: "normal"
    });
  }

  return alerts;
}
