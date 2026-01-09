import express from "express";
import cors from "cors";
import analyzeRouter from "./api/analyze.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/analyze", analyzeRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
