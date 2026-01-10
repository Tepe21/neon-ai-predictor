const API_URL = "https://v3.football.api-sports.io";

export async function fetchUpcomingFixtures(limit = 200) {
  const res = await fetch(`${API_URL}/fixtures?next=${limit}`, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  });

  const data = await res.json();
  return data.response || [];
}
