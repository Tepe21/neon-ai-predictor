/**
 * Corner Probability Engine v1
 * One suggested market per match (65' → FT)
 */

export function calculateCornerProbability({ minute, corners, odds }) {
  if (!minute || minute < 65 || !corners || !odds?.length) {
    return null;
  }

  const totalCorners = corners.home + corners.away;

  // Βρίσκουμε Over corner lines
  const overLines = odds
    .filter(o => o.value.toLowerCase().includes("over"))
    .map(o => ({
      line: o.value,
      odd: parseFloat(o.odd)
    }))
    .filter(o => o.odd >= 1.75 && o.odd <= 2.40); // πιο αυστηρό από goals

  if (!overLines.length) return null;

  // Επιλογή line με βάση total corners
  let selected = null;

  for (const o of overLines) {
    const lineCorners = parseFloat(o.line.replace("Over ", ""));
    if (
      (totalCorners <= 7 && lineCorners <= 9.5) ||
      (totalCorners >= 8 && totalCorners <= 9 && lineCorners <= 10.5) ||
      (totalCorners >= 10 && lineCorners <= 11.5)
    ) {
      selected = o;
      break;
    }
  }

  if (!selected) return null;

  // Confidence
  let confidence = 58;

  // Minute factor
  if (minute >= 70 && minute <= 75) confidence += 6;
  if (minute >= 76 && minute <= 82) confidence += 10;
  if (minute > 82) confidence += 6;

  // Corner pressure
  if (totalCorners >= 8) confidence += 6;
  if (totalCorners >= 10) confidence += 8;

  // Odds sanity
  if (selected.odd >= 1.95 && selected.odd <= 2.25) confidence += 6;

  if (confidence > 92) confidence = 92;

  // Level
  let level = "normal";
  if (confidence >= 85) level = "bomb";
  else if (confidence >= 75) level = "high";

  return {
    market: `${selected.line} Corners`,
    odd: selected.odd,
    confidence,
    level
  };
}
