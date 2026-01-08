// src/server.js
import express from "express";
import dotenv from "dotenv";
import fixturesRoutes from "./api/fixtures.js";

dotenv.config();

const app = express();
app.use(express.json());

// routes
app.use("/api/fixtures", fixturesRoutes);

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
