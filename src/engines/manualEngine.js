export function runManualEngine({ fixtures, market, time }) {
  if (!fixtures || fixtures.length === 0) return [];

  const results = fixtures.map(fx => {
    let confidence = 0;

    if (market === "goals") {
      confidence =
        Math.random() * 40 + // προσωρινό heuristic
        (time === "half" ? 10 : 20);
    }

    if (market === "corners") {
      confidence =
        Math.random() * 35 +
        (time === "half" ? 15 : 25);
    }

    return {
      fixtureId: fx.id,
      match: `${fx.home} vs ${fx.away}`,
      league: fx.league,
      kickoff: fx.date,
      market,
      time,
      confidence: Math.round(confidence)
    };
  });

  return results
    .filter(r => r.confidence >= 50)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 2);
}
