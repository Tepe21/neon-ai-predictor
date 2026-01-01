import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ROUTES
import predictRoute from "./routes/predict.js";
import { router as subscribeRoute } from "./routes/subscribe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());

// ===== API ROUTES =====
app.use("/api/predict", predictRoute);
app.use("/api/subscribe", subscribeRoute);

// ===== STATIC FILES (PWA) =====
app.use(express.static(path.join(__dirname, "public")));

// ===== FALLBACK (index.html) =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
