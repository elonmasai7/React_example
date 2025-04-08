import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_KEY = "3e07a8818422cc0e9dc24197eb83522f"; // Replace with a valid API key from OpenWeather
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

function App() {
  const [city, setCity] = useState("Nairobi");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: -1.286389, lon: 36.817223 });
  const inputRef = useRef(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
      setWeather(response.data);
      setTemperatureHistory((prevHistory) => [...prevHistory.slice(-4), response.data.main.temp]);
      setCoordinates({ lat: response.data.coord.lat, lon: response.data.coord.lon });
    } catch (err) {
      setError("City not found. Please try again.");
    }
    setLoading(false);
  };

  const chartData = {
    labels: temperatureHistory.map((_, index) => `T-${temperatureHistory.length - index}`),
    datasets: [
      {
        label: "Temperature (°C) over time",
        data: temperatureHistory,
        fill: false,
        backgroundColor: "#61dafb",
        borderColor: "#ffffff",
        pointBackgroundColor: "#ff6384",
        pointBorderColor: "#ffffff",
      },
    ],
  };

  return (
    <div className="container text-center py-5" style={{ background: "linear-gradient(to right, #667eea, #764ba2)", minHeight: "100vh", color: "#fff" }}>
      <header className="card p-4 shadow-lg bg-transparent border-0">
        <motion.h1 className="mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          Real-Time Weather App
        </motion.h1>
        <div className="input-group mb-3">
          <motion.input
            ref={inputRef}
            type="text"
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            whileFocus={{ scale: 1.1 }}
          />
          <motion.button className="btn btn-primary" onClick={fetchWeather} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            Get Weather
          </motion.button>
        </div>
        {loading && <motion.p className="text-warning" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}>Loading...</motion.p>}
        {error && <motion.p className="text-danger" animate={{ x: [-10, 10, -10, 0] }} transition={{ duration: 0.5 }}>{error}</motion.p>}
        {weather && (
          <motion.div className="card p-4 mt-4 shadow-sm bg-dark bg-opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <h2 className="text-light">{weather.name}</h2>
            <p className="text-muted">Temperature: {weather.main.temp}°C</p>
            <p className="text-muted">Wind Speed: {weather.wind.speed} m/s</p>
            <p className="text-muted">Condition: {weather.weather[0].description}</p>
            <div className="my-3">
              <h5 className="text-light">Temperature Trends</h5>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="map-container mt-3">
              <MapContainer center={[coordinates.lat, coordinates.lon]} zoom={10} style={{ height: "300px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[coordinates.lat, coordinates.lon]}>
                  <Popup>
                    {weather.name} - {weather.weather[0].description}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </motion.div>
        )}
      </header>
    </div>
  );
}

export default App;
