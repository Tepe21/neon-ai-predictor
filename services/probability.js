export function calculateGoalProbability(match) {
  let score = 0;

  // 1️⃣ Minute pressure
  if (match.minute === 68) score += 0.10;
  if (match.minute === 69) score += 0.15;
  if (match.minute === 70) score += 0.20;

  // 2️⃣ Tempo
  if (match.stats.shotsLast10 >= 4) score += 0.1;
  if (match.stats.dangerousAttacks >= 12) score += 0.1;
  if (match.stats.pressure >= 0.7) score += 0.05;

  // 3️⃣ Score context
  if (match.score === "0-0") score += 0.15;
  else if (match.score === "1-0" || match.score === "0-1") score += 0.1;
  else score -= 0.1;

  // 4️⃣ Odds sanity
  if (match.oddsOver05 >= 1.75 && match.oddsOver05 <= 1.9) {
    score += 0.15;
  } else {
    score -= 0.15;
  }

  // 5️⃣ Consistency filter
  let quality = 0;
  if (match.stats.shotsLast10 >= 4) quality++;
  if (match.stats.dangerousAttacks >= 12) quality++;
  if (match.stats.pressure >= 0.7) quality++;

  if (quality < 2) return 0;

  return Number(Math.min(score, 1).toFixed(2));
}
