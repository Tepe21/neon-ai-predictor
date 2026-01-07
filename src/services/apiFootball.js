import fetch from "node-fetch";

const API_BASE = "https://v3.football.api-sports.io";

const headers = {
  "x-apisports-key": process.env.API_FOOTBALL_KEY,
};

export async function apiGet(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}${endpoint}?${query}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  return data.response || [];
}
