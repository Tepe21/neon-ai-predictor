// services/liveDataFetcher.js

export async function fetchLiveData(matchId) {
  // MOCK live data (προσωρινό)
  // Σε λίγο θα το αντικαταστήσουμε με πραγματικό feed

  const minute = Math.floor(Math.random() * 60) + 10;
  const corners = Math.floor(minute / 5) + Math.floor(Math.random() * 2);
  const homeGoals = Math.random() > 0.7 ? 1 : 0;
  const awayGoals = Math.random() > 0.8 ? 1 : 0;

  return {
    minute,
    corners,
    homeGoals,
    awayGoals
  };
}
