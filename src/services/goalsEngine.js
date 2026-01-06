// services/goalsEngine.js

export function getGoalSuggestion(live, time) {
  const minute = live.minute;
  const goals = live.homeGoals + live.awayGoals;

  if (minute < 10) {
    return {
      pick: null,
      reason: "Too early"
    };
  }

  const rate = goals / minute;

  let expected;
  let lines;

  if (time === "HT") {
    expected = rate * 45 * 1.1;
    lines = [0.5, 1.5, 2.5];
  } else {
    expected = rate * 90 * 1.05;
    lines = [1.5, 2.5, 3.5, 4.5];
  }

  const safetyMargin = 0.5;
  let selectedLine = null;

  for (let line of lines) {
    if (expected >= line + safetyMargin) {
      selectedLine = line;
    }
  }

  if (!selectedLine) {
    return {
      pick: null,
      reason: "No value"
    };
  }

  return {
    pick: `Over ${selectedLine} Goals (${time})`,
    expected: expected.toFixed(2),
    rate: rate.toFixed(3)
  };
}
