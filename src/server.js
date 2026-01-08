import express from "express";
import cors from "cors";

import analyzeRouter from "./api/analyze.js";
import fixturesRouter from "./api/fixtures.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// health
app.get("/", (req, res) => {
  res.json({ status: "AI Football Picks backend is running" });
});

// routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/fixtures", fixturesRouter);

// start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
