const API_BASE = "https://v3.football.api-sports.io";

const headers = {
  "x-apisports-key": process.env.API_FOOTBALL_KEY,
};

export async function getUpcomingFixtures(limit = 50) {
  const url = `${API_BASE}/fixtures?next=${limit}`;

  const res = await fetch(url, { headers });
  const data = await res.json();

  if (!data.response) {
    throw new Error("API-Football returned invalid response");
  }

  return data.response;
}
