import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { buildSuggestionEngine } from "./engines/suggestionEngine.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.API_FOOTBALL_KEY;

// ====================
// HEALTH CHECK
// ====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ====================
// FETCH LIVE FIXTURES
// ====================
async function getLiveFixtures() {
  const url = "https://v3.football.api-sports.io/fixtures?live=all";

  const response = await fetch(url, {
    headers: { "x-apisports-key": API_KEY }
  });

  const data = await response.json();
  return data.response || [];
}

// ====================
// ANALYZE ENDPOINT
// ====================
app.post("/api/analyze", async (req, res) => {
  try {
    const { match, category, halftime } = req.body;

    if (!match || match.trim().length < 3) {
      return res.json({ error: "Please enter a match name" });
    }

    const fixtures = await getLiveFixtures();

    // ---------- FIND MATCH ----------
    const found = fixtures.find(f => {
      const home = f.teams.home.name.toLowerCase();
      const away = f.teams.away.name.toLowerCase();
      const input = match.toLowerCase();

      return (
        home.includes(input) ||
        away.includes(input) ||
        `${home} vs ${away}`.includes(input) ||
        `${home}-${away}`.includes(input)
      );
    });

    if (!found) {
      return res.json({ error: "Match not found or not live" });
    }

    const minute = found.fixture.status.elapsed;

    // If user selected Half-Time but match already passed HT
    if (halftime === true && minute > 45) {
      return res.json({ 
        error: "Half-Time suggestions not available after HT"
      });
    }

    // ---------- EXTRACT LIVE STATS ----------
    let cornersHome = 0;
    let cornersAway = 0;

    if (found.statistics) {
      const cornersStat = found.statistics.find(
        s => s.type === "Corner Kicks"
      );
      if (cornersStat) {
        cornersHome = cornersStat.value.home || 0;
        cornersAway = cornersStat.value.away || 0;
      }
    }

    const matchData = {
      minute,
      goalsHome: found.goals.home,
      goalsAway: found.goals.away,
      cornersHome,
      cornersAway
    };

    // ---------- RUN ENGINE ----------
    const engine = buildSuggestionEngine(matchData);

    let suggestionObj;

    if (category === "corners") {
      suggestionObj = engine.getCornerSuggestion();
    } 
    else if (category === "nextgoal") {
      suggestionObj = engine.getNextGoalSuggestion();
    } 
    else {
      suggestionObj = engine.getGoalSuggestion();
    }

    // ---------- RESPONSE ----------
    res.json({
      match: `${found.teams.home.name} vs ${found.teams.away.name}`,
      minute,
      suggestion: suggestionObj.text,
      confidence: suggestionObj.confidence
    });

  } catch (err) {
    console.error("Analyze error:", err);
    res.json({ error: "Server error" });
  }
});

// ====================
// START SERVER
// ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("AI Football Picks backend running on port " + PORT);
});
