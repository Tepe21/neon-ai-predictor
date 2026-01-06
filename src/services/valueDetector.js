// services/valueDetector.js

export function detectValue(result, market) {
  if (!result || !result.pick) {
    return { tag: "none" };
  }

  const line = parseFloat(result.pick.match(/Over ([0-9.]+)/)[1]);
  const expected = parseFloat(result.expected);

  let modelProb;
  if (market === "corners") {
    modelProb = Math.min(0.95, expected / (line + 1));
  } else {
    modelProb = Math.min(0.90, expected / (line + 0.5));
  }

  // MOCK market odds (προσωρινό)
  const odds = (Math.random() * 1.5 + 1.8).toFixed(2); // 1.80 – 3.30
  const impliedProb = 1 / odds;

  const valueGap = modelProb - impliedProb;

  if (odds >= 2.0 && valueGap >= 0.15) {
    return {
      tag: "BOMB",
      odds,
      modelProb: modelProb.toFixed(2),
      impliedProb: impliedProb.toFixed(2),
      valueGap: valueGap.toFixed(2)
    };
  }

  if (valueGap >= 0.08) {
    return {
      tag: "HIGH",
      odds,
      modelProb: modelProb.toFixed(2),
      impliedProb: impliedProb.toFixed(2),
      valueGap: valueGap.toFixed(2)
    };
  }

  return { tag: "NORMAL" };
}
