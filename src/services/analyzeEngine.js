import fetch from "node-fetch";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = "https://v3.football.api-sports.io";

export async function analyzeMatch({ query, mode, market }) {
  const headers = {
    "x-apisports-key": API_KEY,
  };

  // 1. Search fixtures by team name (free text)
  const searchRes = await fetch(
    `${API_URL}/fixtures?search=${encodeURIComponent(query)}`,
    { headers }
  );

  const searchData = await searchRes.json();

  if (!searchData.response || searchData.response.length === 0) {
    return { type: "empty", results: [] };
  }

  // If more than one match found → return list
  if (searchData.response.length > 1) {
    return {
      type: "multiple",
      results: searchData.response.map(f => ({
        fixtureId: f.fixture.id,
        league: f.league.name,
        date: f.fixture.date,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
        status: f.fixture.status.short
      }))
    };
  }

  // 2. Single match → ANALYZE
  const fixture = searchData.response[0];
  const minute = fixture.fixture.status.elapsed || 0;

  // Simple confidence logic (beta)
  let confidence = 55;

  if (mode === "live" && minute >= 60) confidence += 10;
  if (market === "goals") confidence += 10;
  if (fixture.goals.home + fixture.goals.away === 0) confidence += 5;

  if (confidence > 85) confidence = 85;

  let label = "Normal";
  if (confidence >= 70) label = "High Value";
  if (confidence >= 80) label = "Value Bomb";

  return {
    type: "single",
    result: {
      fixtureId: fixture.fixture.id,
      match: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
      league: fixture.league.name,
      minute,
      market,
      confidence,
      label
    }
  };
}
