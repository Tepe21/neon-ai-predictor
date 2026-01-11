export function buildSuggestionEngine(match) {

  const totalGoals = match.goalsHome + match.goalsAway;
  const totalCorners = match.cornersHome + match.cornersAway;
  const minute = match.minute;

  // -------------------
  // GOALS ENGINE
  // -------------------
  function getGoalSuggestion() {

    // If already over passed → suggest next threshold
    let target;

    if (totalGoals < 1) target = "Over 0.5 Total Goals";
    else if (totalGoals < 2) target = "Over 1.5 Total Goals";
    else if (totalGoals < 3) target = "Over 2.5 Total Goals";
    else if (totalGoals < 4) target = "Over 3.5 Total Goals";
    else target = "No safe goal suggestion";

    // Confidence based on minute + current pace
    let confidence = 50;

    if (minute > 60) confidence += 10;
    if (minute > 75) confidence += 10;
    if (totalGoals >= 2) confidence += 5;

    return {
      text: target,
      confidence: Math.min(confidence, 85)
    };
  }

  // -------------------
  // CORNERS ENGINE
  // -------------------
  function getCornerSuggestion() {

    let target;

    if (totalCorners < 6) target = "Over 5.5 Total Corners";
    else if (totalCorners < 8) target = "Over 7.5 Total Corners";
    else if (totalCorners < 10) target = "Over 9.5 Total Corners";
    else if (totalCorners < 12) target = "Over 11.5 Total Corners";
    else target = "No safe corner suggestion";

    let confidence = 55;

    if (minute > 55) confidence += 10;
    if (minute > 70) confidence += 10;
    if (totalCorners >= 8) confidence += 5;

    return {
      text: target,
      confidence: Math.min(confidence, 90)
    };
  }

  // -------------------
  // NEXT GOAL ENGINE
  // -------------------
  function getNextGoalSuggestion() {

    let leadingTeam;

    if (match.goalsHome > match.goalsAway) {
      leadingTeam = "Home team likely to score next";
    } 
    else if (match.goalsAway > match.goalsHome) {
      leadingTeam = "Away team likely to score next";
    } 
    else {
      leadingTeam = "Either team may score next";
    }

    let confidence = 60;
    if (minute > 70) confidence += 10;
    if (minute > 80) confidence += 5;

    return {
      text: leadingTeam,
      confidence: Math.min(confidence, 85)
    };
  }

  return {
    getGoalSuggestion,
    getCornerSuggestion,
    getNextGoalSuggestion
  };
}
