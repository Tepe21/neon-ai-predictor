import fetch from "node-fetch";

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

export async function fetchUpcomingBatch(next = 50) {
  const res = await fetch(
    `${API_URL}/fixtures?next=${next}&timezone=Europe/Athens`,
    {
      headers: {
        "x-apisports-key": API_KEY
      }
    }
  );

  const data = await res.json();

  return (data.response || []).map(f => ({
    id: f.fixture.id,
    date: f.fixture.date,
    home: f.teams.home.name,
    away: f.teams.away.name,
    league: f.league.name,
    statistics: {} // placeholder
  }));
}
