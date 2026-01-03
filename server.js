import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// routes
import liveRoutes from "./routes/live.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔗 API ROUTES
app.use("/api", liveRoutes);

// ✅ Health check (πολύ σημαντικό για Render)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

// 🌍 Default route (για να μην βλέπεις Cannot GET /)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
