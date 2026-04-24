const express = require("express");
const cors = require("cors");
const { processBFHL } = require("./bfhl");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "BFHL API is running" });
});

// Main endpoint
app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (data === undefined || data === null) {
      return res.status(400).json({ error: "'data' field is required in request body" });
    }

    const result = processBFHL(data);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ BFHL API running on http://localhost:${PORT}`);
});
