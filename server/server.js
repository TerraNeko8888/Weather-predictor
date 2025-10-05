
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Izinkan akses dari GitHub Pages
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Proxy ke API BMKG
app.get("/api/weather/:id", async (req, res) => {
  try {
    const cityId = req.params.id;
    const response = await fetch(`https://ibnux.github.io/BMKG-importer/cuaca/${cityId}.json`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data BMKG" });
  }
});

// Proxy ke Gemini (aman dari frontend)
app.post("/api/gemini", express.json(), async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal memanggil Gemini API" });
  }
});

app.listen(PORT, () => console.log(`✅ Server berjalan di port ${PORT}`));
