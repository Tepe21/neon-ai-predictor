import fetch from "node-fetch";

const API_URL = "https://v3.football.api-sports.io";

export async function getLiveFixtures() {
  const res = await fetch(`${API_URL}/fixtures?live=all`, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  });

  if (!res.ok) {
    throw new Error("API-Football request failed");
  }

  const data = await res.json();
  return data.response;
}
