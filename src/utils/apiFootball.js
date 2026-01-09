import fetch from "node-fetch";

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

export async function getUpcomingFixtures(limit = 200) {
  const res = await fetch(`${API_URL}/fixtures?next=${limit}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();
  return data.response || [];
}
