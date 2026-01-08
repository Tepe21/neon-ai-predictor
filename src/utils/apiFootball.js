import fetch from "node-fetch";

const API_URL = "https://v3.football.api-sports.io";

export async function apiFootball(endpoint, params = {}) {
  const url = new URL(API_URL + endpoint);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, v);
    }
  });

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}
