import express from "express";
import cors from "cors";
import fixturesRouter from "./routes/fixtures.js";
import analyzeRouter from "./routes/analyze.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("API running");
});

app.use("/api/fixtures", fixturesRouter);
app.use("/api/analyze", analyzeRouter);

app.get("/api/debug/env", (_, res) => {
  res.json({
    hasApiKey: !!process.env.API_FOOTBALL_KEY,
    nodeEnv: process.env.NODE_ENV || "unknown",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
