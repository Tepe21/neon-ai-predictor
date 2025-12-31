// services/cornersEngine.js

export function getCornerSuggestion(live, time) {
  const minute = live.minute;
  const corners = live.corners;

  if (minute < 10) {
    return {
      pick: null,
      reason: "Too early"
    };
  }

  const rate = corners / minute;

  let expected;
  let lines;

  if (time === "HT") {
    expected = rate * 45 * 0.9;
    lines = [2.5, 3.5, 4.5, 5.5, 6.5];
  } else {
    expected = rate * 90 * 0.9;
    lines = [8.5, 9.5, 10.5, 11.5, 12.5, 13.5];
  }

  const safetyMargin = 1.0;
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
    pick: `Over ${selectedLine} Corners (${time})`,
    expected: expected.toFixed(2),
    rate: rate.toFixed(3)
  };
}
