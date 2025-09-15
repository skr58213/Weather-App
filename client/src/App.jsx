import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000"; // backend proxy

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState("metric");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(favs);
    if (favs.length) fetchWeather(favs[0]);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = async (cityName) => {
    try {
      setError(null);
      setLoading(true);
      setWeather(null);
      setForecast([]);
      const res = await fetch(`${API_URL}/weather?city=${cityName}&unit=${unit}`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCoords = async (lat, lon) => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/weather/coords?lat=${lat}&lon=${lon}&unit=${unit}`);
      if (!res.ok) throw new Error("Location not found");
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city.trim());
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchByCoords(latitude, longitude);
      },
      () => setError("Unable to retrieve location")
    );
  };

  const toggleFavorite = (cityName) => {
    if (favorites.includes(cityName)) {
      setFavorites(favorites.filter((c) => c !== cityName));
    } else {
      setFavorites([...favorites, cityName]);
    }
  };

  const formatTemp = (t) =>
    unit === "imperial" ? `${Math.round(t)}°F` : `${Math.round(t)}°C`;

  // Background based on time + weather
  const getBackground = () => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    if (!weather) return "from-sky-400 via-blue-300 to-indigo-400";

    switch (weather.weather[0].main.toLowerCase()) {
      case "clear":
        return isNight
          ? "from-indigo-900 via-purple-900 to-black"
          : "from-sky-400 via-blue-300 to-indigo-400";
      case "clouds":
        return "from-gray-300 via-slate-400 to-gray-600";
      case "rain":
        return "from-blue-800 via-sky-600 to-gray-900";
      case "snow":
        return "from-slate-200 via-gray-100 to-slate-400";
      case "thunderstorm":
        return "from-purple-800 via-indigo-700 to-gray-900";
      default:
        return isNight
          ? "from-indigo-900 via-purple-900 to-black"
          : "from-sky-500 via-sky-400 to-indigo-500";
    }
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackground()} transition-all duration-700 overflow-hidden`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-0 w-[200%] h-[200%] bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-full blur-3xl animate-[spin_80s_linear_infinite]" />

        {/* Clouds */}
        <div className="absolute w-[300%] h-44 top-12 bg-[url('https://i.ibb.co/Q9yv5Jk/cloud.png')] bg-repeat-x opacity-40 animate-[clouds_60s_linear_infinite]" />
        <div className="absolute w-[300%] h-52 top-40 bg-[url('https://i.ibb.co/Q9yv5Jk/cloud.png')] bg-repeat-x opacity-20 animate-[clouds_120s_linear_infinite]" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/20 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] max-w-3xl w-full border border-white/30 hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg">
          🌦 Weather Dashboard
        </h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="🔍 Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-5 py-3 rounded-full bg-white/80 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 transform transition">
            Search
          </button>
        </form>

        {/* Geo */}
        <button
          onClick={handleGeo}
          className="w-full px-4 py-3 mb-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:scale-105 transform transition"
        >
          📍 Use My Location
        </button>

        {/* Unit toggle */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className={`${unit === "metric" ? "font-bold text-lg text-white" : "text-gray-300"}`}>
            °C
          </span>
          <button
            onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            className="relative inline-flex h-9 w-20 items-center rounded-full bg-gray-400 transition"
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition ${
                unit === "imperial" ? "translate-x-11" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`${unit === "imperial" ? "font-bold text-lg text-white" : "text-gray-300"}`}>
            °F
          </span>
        </div>

        {/* Error */}
        {error && <p className="text-red-300 text-center mb-4 font-semibold">{error}</p>}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center my-6">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty state */}
        {!weather && !loading && !error && (
          <p className="text-center text-gray-200 italic">
            🌍 Search for a city or use your location to see the weather.
          </p>
        )}

        {/* Current weather */}
        {weather && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{weather.name}</h2>
            <p className="capitalize text-gray-200">{weather.weather[0].description}</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt="icon"
              className="mx-auto drop-shadow-xl"
            />
            <p className="text-6xl font-extrabold text-white drop-shadow-md">
              {formatTemp(weather.main.temp)}
            </p>
            <p className="text-sm text-gray-200">
              Feels like {formatTemp(weather.main.feels_like)}
            </p>

            <button
              onClick={() => toggleFavorite(weather.name)}
              className={`mt-6 px-6 py-3 rounded-full shadow-md hover:scale-110 transform transition ${
                favorites.includes(weather.name)
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              }`}
            >
              {favorites.includes(weather.name) ? "★ Remove Favorite" : "☆ Save Favorite"}
            </button>
          </div>
        )}

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-5 text-center text-white">
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white/30 backdrop-blur-lg p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-center"
                >
                  <div className="text-sm font-medium text-white">
                    {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                    className="mx-auto"
                  />
                  <div className="font-semibold text-lg text-white">
                    {formatTemp(day.main.temp)}
                  </div>
                  <div className="text-xs text-gray-200 capitalize">
                    {day.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-10">
            <h3 className="font-medium mb-3 text-lg text-white">⭐ Favorites</h3>
            <ul className="flex flex-wrap gap-3">
              {favorites.map((fav, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => fetchWeather(fav)}
                    className="px-5 py-2 bg-gradient-to-r from-slate-200 to-slate-400 rounded-full hover:scale-105 transform transition text-gray-800 shadow"
                  >
                    {fav}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Extra keyframes */}
      <style>{`
        @keyframes clouds {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default App;
