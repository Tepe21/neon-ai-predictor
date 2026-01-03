import webpush from "web-push";

// Κρατάμε ποια alerts έχουν σταλεί
const sentAlerts = new Set();

/**
 * Επεξεργάζεται live αγώνες και στέλνει push alerts
 * μόνο όταν υπάρχει πραγματικό value.
 */
export async function processAlerts(matches, subscriptions) {
  if (!Array.isArray(matches) || matches.length === 0) return;
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) return;

  for (const match of matches) {
    if (!match.tag || match.confidence < 70) continue;

    // Μοναδικό ID για να μη στείλει 2 φορές
    const alertId = `${match.id}-${match.tag}`;
    if (sentAlerts.has(alertId)) continue;

    const title =
      match.tag === "VALUE BOMB"
        ? "💣 VALUE BOMB ALERT"
        : "🔥 HIGH VALUE ALERT";

    const body = `${match.home} vs ${match.away}
${match.score} – ${match.minute}'
Confidence: ${match.confidence}%`;

    const payload = JSON.stringify({ title, body });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        console.error("Push send failed:", err.message);
      }
    }

    sentAlerts.add(alertId);
    console.log("🔔 Alert sent:", alertId);
  }
}
