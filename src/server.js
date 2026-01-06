import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import analyzeRoutes from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "..", "public");

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analyze", analyzeRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log("AI Football Picks backend running on", PORT);
});
