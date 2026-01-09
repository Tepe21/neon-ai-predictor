import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// routes
import fixturesRouter from "./api/fixtures.js";
import analyzeRouter from "./api/analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===============================
   GLOBAL MIDDLEWARES
================================ */

// JSON body
app.use(express.json());

// ✅ CORS (απαραίτητο για fetch)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ CSP HEADERS (ΤΟ ΣΗΜΑΝΤΙΚΟΤΕΡΟ)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self' https://neon-ai-predictor.onrender.com",
    ].join("; ")
  );
  next();
});

/* ===============================
   STATIC FRONTEND
================================ */

app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   API ROUTES
================================ */

app.use("/api/fixtures", fixturesRouter);
app.use("/api/analyze", analyzeRouter);

/* ===============================
   HEALTH CHECK
================================ */

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===============================
   FALLBACK (SPA)
================================ */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===============================
   SERVER START
================================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
