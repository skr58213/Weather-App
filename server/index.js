import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 5000 || process.env.PORT;
const API_KEY = process.env.API_KEY;

app.use(cors());

// Weather by city
app.get("/weather", async (req, res) => {
  const { city, unit = "metric" } = req.query;
  if (!city) return res.status(400).json({ error: "City required" });

  try {
    const curRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
    );
    if (!curRes.ok) return res.status(404).json({ error: "City not found" });
    const current = await curRes.json();

    const forecast = await getForecast(current.coord.lat, current.coord.lon, unit);
    res.json({ current, forecast });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Weather by coordinates
app.get("/weather/coords", async (req, res) => {
  const { lat, lon, unit = "metric" } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Coordinates required" });

  try {
    const curRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
    );
    if (!curRes.ok) return res.status(404).json({ error: "Location not found" });
    const current = await curRes.json();

    const forecast = await getForecast(lat, lon, unit);
    res.json({ current, forecast });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Helper: fetch forecast
async function getForecast(lat, lon, unit) {
  const fRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
  );
  const fJson = await fRes.json();

  const daily = {};
  fJson.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date] && item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });

  return Object.values(daily).slice(0, 5);
}

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);