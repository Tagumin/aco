import React, { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MapArea from "./components/MapArea";
import SummaryBar from "./components/SummaryBar";
import Notification from "./components/Notification";
import { reverseGeocode } from "./utils/geocoding";
import { formatTime, formatCurrency } from "./utils/helpers";

function App() {
  const [origin, setOrigin] = useState(null);
  const [destinations, setDestinations] = useState([
    { id: 1, lat: null, lng: null, name: "", color: "#e74c3c" },
    { id: 2, lat: null, lng: null, name: "", color: "#3498db" },
    { id: 3, lat: null, lng: null, name: "", color: "#2ecc71" },
  ]);
  const [fuelPrice, setFuelPrice] = useState(10000);
  const [fuelConsumption, setFuelConsumption] = useState(8);
  const [otherCosts, setOtherCosts] = useState(0);
  const [acoParams, setAcoParams] = useState({
    nAnts: 30,
    nIter: 80,
    alpha: 1.0,
    beta: 3.0,
    rho: 0.3,
    Q: 100,
  });
  const [mode, setMode] = useState("auto");
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bestDistance, setBestDistance] = useState(null);
  const [converged, setConverged] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeDestinationId, setActiveDestinationId] = useState(null);
  const [isPickingOrigin, setIsPickingOrigin] = useState(false);
  const [highlightedSegment, setHighlightedSegment] = useState(null);
  const [routePolylines, setRoutePolylines] = useState([]);
  const mapRef = useRef(null);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addDestination = useCallback(() => {
    if (isLocked) {
      showNotification("System is locked. Clear results to edit.", "error");
      return;
    }
    const colors = [
      "#e74c3c",
      "#3498db",
      "#2ecc71",
      "#9b59b6",
      "#f39c12",
      "#1abc9c",
      "#e67e22",
      "#34495e",
    ];
    const newId =
      destinations.length > 0
        ? Math.max(...destinations.map((d) => d.id)) + 1
        : 1;
    setDestinations((prev) => [
      ...prev,
      {
        id: newId,
        lat: null,
        lng: null,
        name: "",
        color: colors[prev.length % colors.length],
      },
    ]);
  }, [destinations, isLocked, showNotification]);

  const removeDestination = useCallback(
    (id) => {
      if (isLocked) {
        showNotification("System is locked. Clear results to edit.", "error");
        return;
      }
      setDestinations((prev) => prev.filter((d) => d.id !== id));
      if (results) setResults(null);
    },
    [isLocked, showNotification, results],
  );

  const updateDestination = useCallback(
    (id, updates) => {
      if (isLocked) return;
      setDestinations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      );
      if (results) setResults(null);
    },
    [isLocked, results],
  );

  const setOriginPoint = useCallback(
    (lat, lng, name = "") => {
      if (isLocked) {
        showNotification("System is locked. Clear results to edit.", "error");
        return;
      }
      setOrigin({ lat, lng, name });
      if (results) setResults(null);
    },
    [isLocked, showNotification, results],
  );

  const clearAll = useCallback(() => {
    setOrigin(null);
    setDestinations([
      { id: 1, lat: null, lng: null, name: "", color: "#e74c3c" },
      { id: 2, lat: null, lng: null, name: "", color: "#3498db" },
      { id: 3, lat: null, lng: null, name: "", color: "#2ecc71" },
    ]);
    setResults(null);
    setIsLocked(false);
    setProgress(0);
    setBestDistance(null);
    setConverged(false);
    setRoutePolylines([]);
    setHighlightedSegment(null);
    showNotification(
      "All data cleared. Ready for new optimization.",
      "success",
    );
  }, [showNotification]);

  const handleMapClick = useCallback(
    async (lat, lng) => {
      if (isPickingOrigin) {
        const name = await reverseGeocode(lat, lng);
        setOriginPoint(lat, lng, name);
        setIsPickingOrigin(false);
        showNotification("Origin set: " + name, "success");
      } else if (activeDestinationId !== null) {
        const name = await reverseGeocode(lat, lng);
        updateDestination(activeDestinationId, { lat, lng, name });
        setActiveDestinationId(null);
        showNotification(`Destination set: ${name}`, "success");
      }
    },
    [
      isPickingOrigin,
      activeDestinationId,
      setOriginPoint,
      updateDestination,
      showNotification,
    ],
  );

  const validDestinations = destinations.filter(
    (d) => d.lat !== null && d.lng !== null,
  );

  return (
    <div className="app">
      {window.location.protocol === "file:" && (
        <div className="protocol-warning">
          ⚠️ You are running this app from a file:// protocol. Some features may
          not work correctly. Please use a local server (e.g.,{" "}
          <code>npx serve build</code> or <code>npm start</code>).
        </div>
      )}
      <Header />
      <div className="main-container">
        <Sidebar
          origin={origin}
          setOriginPoint={setOriginPoint}
          destinations={destinations}
          addDestination={addDestination}
          removeDestination={removeDestination}
          updateDestination={updateDestination}
          fuelPrice={fuelPrice}
          setFuelPrice={setFuelPrice}
          fuelConsumption={fuelConsumption}
          setFuelConsumption={setFuelConsumption}
          otherCosts={otherCosts}
          setOtherCosts={setOtherCosts}
          acoParams={acoParams}
          setAcoParams={setAcoParams}
          mode={mode}
          setMode={setMode}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          progress={progress}
          setProgress={setProgress}
          bestDistance={bestDistance}
          setBestDistance={setBestDistance}
          converged={converged}
          setConverged={setConverged}
          results={results}
          setResults={setResults}
          clearAll={clearAll}
          showNotification={showNotification}
          activeDestinationId={activeDestinationId}
          setActiveDestinationId={setActiveDestinationId}
          isPickingOrigin={isPickingOrigin}
          setIsPickingOrigin={setIsPickingOrigin}
          highlightedSegment={highlightedSegment}
          setHighlightedSegment={setHighlightedSegment}
          routePolylines={routePolylines}
          setRoutePolylines={setRoutePolylines}
          mapRef={mapRef}
          />
        <MapArea
          origin={origin}
          destinations={destinations}
          validDestinations={validDestinations}
          results={results}
          isPickingOrigin={isPickingOrigin}
          activeDestinationId={activeDestinationId}
          onMapClick={handleMapClick}
          updateDestination={updateDestination}
          setOriginPoint={setOriginPoint}
          isLocked={isLocked}
          highlightedSegment={highlightedSegment}
          setHighlightedSegment={setHighlightedSegment}
          routePolylines={routePolylines}
          setRoutePolylines={setRoutePolylines}
          mapRef={mapRef}
          />
      </div>
      <SummaryBar
        results={results}
        origin={origin}
        validDestinations={validDestinations}
      />
      <Notification notification={notification} />
    </div>
  );
}

export default App;




