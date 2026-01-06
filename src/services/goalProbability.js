/**
 * Goal Probability Engine v1
 * Returns ONE suggested market per match
 */

export function calculateGoalProbability({ minute, score, odds }) {
  if (!minute || minute < 65 || !score || !odds?.length) {
    return null;
  }

  const [homeGoals, awayGoals] = score.split("-").map(Number);
  const totalGoals = homeGoals + awayGoals;

  // Βρίσκουμε όλα τα Over lines
  const overLines = odds
    .filter(o => o.value.toLowerCase().includes("over"))
    .map(o => ({
      line: o.value,
      odd: parseFloat(o.odd)
    }))
    .filter(o => o.odd >= 1.70 && o.odd <= 2.30); // value window

  if (!overLines.length) return null;

  // Επιλέγουμε line με βάση game state
  let selected = null;

  for (const o of overLines) {
    const lineGoals = parseFloat(o.line.replace("Over ", ""));

    // Λογική επιλογής line
    if (
      (totalGoals === 0 && lineGoals <= 2.5) ||
      (totalGoals === 1 && lineGoals <= 2.5) ||
      (totalGoals === 2 && lineGoals <= 3.5)
    ) {
      selected = o;
      break;
    }
  }

  if (!selected) return null;

  // Υπολογισμός confidence
  let confidence = 60;

  // Minute factor
  if (minute >= 70 && minute <= 75) confidence += 6;
  if (minute >= 76 && minute <= 82) confidence += 10;
  if (minute > 82) confidence += 6;

  // Score factor
  if (totalGoals === 0) confidence += 8;
  if (totalGoals === 1) confidence += 6;

  // Odds sanity
  if (selected.odd >= 1.90 && selected.odd <= 2.15) confidence += 6;

  if (confidence > 92) confidence = 92;

  // Level
  let level = "normal";
  if (confidence >= 85) level = "bomb";
  else if (confidence >= 75) level = "high";

  return {
    market: `${selected.line} Goals`,
    odd: selected.odd,
    confidence,
    level
  };
}
