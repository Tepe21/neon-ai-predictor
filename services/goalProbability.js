// =====================================
// 🧠 GOAL PROBABILITY ENGINE (v1)
// =====================================

export function calculateGoalProbability(match) {
  const minute = match.minute;

  if (!minute || minute < 65 || minute > 80) {
    return null;
  }

  const [homeGoals, awayGoals] = match.score
    .split("-")
    .map(Number);

  let probability = 0;

  // ⏱ Base probability by minute
  if (minute >= 65 && minute <= 69) probability = 55;
  else if (minute >= 70 && minute <= 74) probability = 62;
  else if (minute >= 75 && minute <= 80) probability = 68;

  const totalGoals = homeGoals + awayGoals;

  // ⚽ Score modifiers
  if (homeGoals === 0 && awayGoals === 0) probability += 10;
  else if (homeGoals === awayGoals) probability += 8;
  else probability += 4;

  // Too many goals already
  if (totalGoals >= 3) probability -= 5;

  // Clamp between 0–95
  probability = Math.max(0, Math.min(95, probability));

  // Tag
  let tag = null;
  if (probability >= 80) tag = "VALUE BOMB";
  else if (probability >= 70) tag = "HIGH VALUE";

  return {
    confidence: probability,
    tag
  };
}
