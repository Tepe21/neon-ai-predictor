import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

/* ------------------ FIX PATHS ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬅️ ΠΡΟΣΟΧΗ ΕΔΩ: ../public
const publicPath = path.join(__dirname, "..", "public");

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());

/* ------------------ STATIC FILES ------------------ */
app.use(express.static(publicPath));

/* ------------------ API HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Football Picks backend is running",
  });
});

/* ------------------ ROOT → FRONTEND ------------------ */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
