// src/server.js
import express from "express";
import cors from "cors";

import analyzeRouter from "./api/analyze.js";
import fixturesRouter from "./api/fixtures.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/fixtures", fixturesRouter);

// health check
app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
