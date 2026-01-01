import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    result: {
      pick: "Over 9.5 Corners"
    },
    value: {
      tag: "HIGH"
    }
  });
});

export default router;
