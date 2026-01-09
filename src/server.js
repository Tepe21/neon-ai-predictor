import express from "express";
import cors from "cors";
import fixturesRouter from "./api/fixtures.js";
import analyzeRouter from "./api/analyze.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/fixtures", fixturesRouter);
app.use("/api/analyze", analyzeRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
