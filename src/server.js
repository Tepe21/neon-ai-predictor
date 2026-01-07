import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fixturesRoutes from "./api/fixtures.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/fixtures", fixturesRoutes);

app.get("/", (req, res) => {
  res.send("AI Football Picks backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
