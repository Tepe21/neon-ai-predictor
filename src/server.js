import express from "express";
import fetch from "node-fetch";
import cors from "cors";

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
// SIMPLE LIVE SUGGESTION ENGINE
// ====================
function buildSuggestion(found, category, halftime) {
  const minute = found.fixture.status.elapsed;

  const goalsHome = found.goals.home || 0;
  const goalsAway = found.goals.away || 0;
  const totalGoals = goalsHome + goalsAway;

  const cornersHome = found.statistics?.find(s => s.team.id === found.teams.home.id)
    ?.statistics.find(x => x.type === "Corner Kicks")?.value || 0;

  const cornersAway = found.statistics?.find(s => s.team.id === found.teams.away.id)
    ?.statistics.find(x => x.type === "Corner Kicks")?.value || 0;

  const totalCorners = cornersHome + cornersAway;

  let suggestion = "";
  let confidence = 50;

  // ===== GOALS =====
  if (category === "goals") {
    if (halftime && minute > 45) {
      return { error: "Half Time market not available after halftime" };
    }

    if (totalGoals >= 2) {
      suggestion = "No Goal Market Available";
      confidence = 0;
    } else {
      suggestion = halftime
        ? "Over 0.5 Half Time Goals"
        : "Over 1.5 Total Goals";
      confidence = 72;
    }
  }

  // ===== CORNERS =====
  else if (category === "corners") {
    if (totalCorners >= 10) {
      suggestion = "No Corner Market Available";
      confidence = 0;
    } else {
      suggestion = "Over 9.5 Total Corners";
      confidence = 69;
    }
  }

  // ===== NEXT GOAL =====
  else if (category === "nextgoal") {
    suggestion = `Next Goal: ${found.teams.home.name}`;
    confidence = 64;
  }

  return { suggestion, confidence };
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

    const found = fixtures.find(f => {
      const full = `${f.teams.home.name} vs ${f.teams.away.name}`.toLowerCase();
      return full.includes(match.toLowerCase());
    });

    if (!found) {
      return res.json({ error: "Match not found or not live" });
    }

    const result = buildSuggestion(found, category, halftime);

    if (result.error) {
      return res.json({ error: result.error });
    }

    res.json({
      match: `${found.teams.home.name} vs ${found.teams.away.name}`,
      category,
      suggestion: result.suggestion,
      confidence: result.confidence,
      minute: found.fixture.status.elapsed
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
