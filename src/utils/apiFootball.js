// src/utils/apiFootball.js
import fetch from "node-fetch";

const API_BASE = "https://v3.football.api-sports.io";

export async function apiGet(endpoint, params = {}) {
  const url = new URL(API_BASE + endpoint);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.response || [];
}
