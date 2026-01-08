import axios from "axios";

const API_BASE = "https://v3.football.api-sports.io";

export async function apiFootballGet(endpoint, params = {}) {
  const res = await axios.get(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY
    },
    params
  });

  return res.data;
}
