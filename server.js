import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

/* ------------------ FIX PATHS ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());

/* ------------------ STATIC APP ------------------ */
app.use(express.static(path.join(__dirname, "public")));

/* ------------------ API HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Football Picks backend is running"
  });
});

/* ------------------ ROOT → APP ------------------ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
