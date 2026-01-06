import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import searchRoutes from "./routes/search.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());

/* ------------------ HEALTH CHECK ------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Football Picks API",
  });
});

/* ------------------ MANUAL SEARCH ------------------ */
app.use("/api/search", searchRoutes);

/* ------------------ ROOT ------------------ */
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
