import express from "express";
import { resolveMatch } from "../services/matchResolver.js";
import { fetchLiveData } from "../services/liveDataFetcher.js";
import { getCornerSuggestion } from "../services/cornersEngine.js";
import { getGoalSuggestion } from "../services/goalsEngine.js";
import { detectValue } from "../services/valueDetector.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { match, market, time } = req.body;

  if (!match || !market || !time) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const matchData = await resolveMatch(match);
  if (!matchData) {
    return res.json({ error: "Match not live" });
  }

  const live = await fetchLiveData(matchData.id);

  let result;
  if (market === "corners") {
    result = getCornerSuggestion(live, time);
  } else if (market === "goals") {
    result = getGoalSuggestion(live, time);
  } else {
    return res.json({ error: "Unknown market" });
  }

  const value = detectValue(result, market);

  return res.json({
    match: matchData.name,
    live,
    result,
    value
  });
});

export default router;
