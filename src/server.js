import express from "express";
import cors from "cors";

import fixturesRoutes from "./api/fixtures.js";
import analyzeRoutes from "./api/analyze.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/fixtures", fixturesRoutes);
app.use("/api/analyze", analyzeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`AI Football Picks backend running on ${PORT}`)
);
