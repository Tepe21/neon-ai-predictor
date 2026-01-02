import { getMockLiveMatches } from "./mockLiveMatches.js";
import { calculateGoalProbability } from "./probability.js";

// 🔒 Anti-spam memory
const alertedMatches = new Map(); // match -> timestamp
const COOLDOWN_MS = 10 * 60 * 1000; // 10 λεπτά

function getTag(probabilityPercent) {
  if (probabilityPercent >= 90) return "💣 BOMB";
  if (probabilityPercent >= 80) return "🔥 VERY HIGH";
  if (probabilityPercent >= 70) return "⚡ HIGH";
  return null;
}

export function startGoalScanner() {
  console.log("🧠 Live Goal Scanner started (TEST MODE)");

  setInterval(() => {
    const now = Date.now();
    const matches = getMockLiveMatches();

    matches.forEach(match => {
      // ⏱ minute window
      if (match.minute < 68 || match.minute > 70) return;

      // 🛑 Anti-spam / cooldown
      const lastAlert = alertedMatches.get(match.match);
      if (lastAlert && now - lastAlert < COOLDOWN_MS) return;

      const probability = calculateGoalProbability(match);
      if (probability === 0) {
        console.log(`
🟢 NO SIGNAL
${match.league}
${match.match}
${match.minute}' → Low consistency
`);
        return;
      }

      const percent = Math.round(probability * 100);
      const tag = getTag(percent);

      console.log(`
📊 LIVE CHECK
${match.league}
${match.match}
Minute: ${match.minute}'
Odds Over Goal: ${match.oddsOver05}
Confidence: ${percent}%
`);

      if (tag) {
        alertedMatches.set(match.match, now);

        // 🧾 Final message format (pre-push)
        console.log(`
🚨 LIVE VALUE ALERT ${tag}
⚽ ${match.match}
⏱ ${match.minute}' | Over Goal @${match.oddsOver05}
📈 Confidence: ${percent}%
🧠 AI Football Picks
(NOT SENT – TEST MODE)
`);
      }
    });
  }, 60000);
}
