import webpush from "web-push";

const sentAlerts = new Set();

export async function processAlerts(matches, subscriptions) {
  if (!Array.isArray(matches)) return;

  for (const match of matches) {
    if (!match.tag || match.confidence < 70) continue;

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
      if (!sub.isPremium) continue;

      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        console.error("Push error:", err.message);
      }
    }

    sentAlerts.add(alertId);
  }
}
