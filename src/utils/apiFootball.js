const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

async function apiFetch(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value);
  });

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  return data.response || [];
}

/**
 * 🔥 ΣΤΑΘΕΡΟ UPCOMING
 * Χρησιμοποιεί ΜΟΝΟ next (όπως είπε το API-Football)
 */
export async function getUpcomingFixtures(limit = 200) {
  return apiFetch("/fixtures", {
    next: limit,
    status: "NS",
  });
}

/**
 * LIVE fixtures (έτοιμο για alerts)
 */
export async function getLiveFixtures() {
  return apiFetch("/fixtures", {
    live: "all",
  });
}
