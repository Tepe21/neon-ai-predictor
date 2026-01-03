import express from "express";
import webpush from "web-push";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const subscriptions = [];

webpush.setVapidDetails(
  "mailto:test@example.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

app.post("/api/subscribe", (req, res) => {
  subscriptions.push(req.body);
  res.json({ success: true });
});

app.get("/api/push/test", async (req, res) => {
  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "⚽ AI Alert",
          body: "High value GOAL opportunity detected!",
        })
      );
      sent++;
    } catch (e) {
      console.error(e);
    }
  }

  res.json({ sent });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", subscriptions: subscriptions.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
