import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

/**
 * LIVE ALERTS API
 * Active ONLY from 65' until FT
 * Structure is FINAL
 */
app.get("/api/live-alerts", async (req, res) => {

  // ⛔ προσωρινά mock — εδώ θα μπει ο real scanner
  const alerts = [
    {
      id: "goal_roma",
      type: "goal", // goal | corner
      match: "Roma – Atalanta",
      minute: 67,
      market: "Over 1.5 Goals",
      confidence: 76
    },
    {
      id: "corner_arsenal",
      type: "corner",
      match: "Arsenal – Spurs",
      minute: 72,
      market: "Over 10.5 Corners",
      confidence: 88
    }
  ];

  // φίλτρο 65' – FT
  const filtered = alerts.filter(a => a.minute >= 65 && a.minute <= 90);

  res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
