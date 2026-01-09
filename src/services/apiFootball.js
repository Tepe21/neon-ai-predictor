const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

export async function apiFetch(endpoint, params = {}) {
  const url = new URL(API_URL + endpoint);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  return data.response || [];
}
