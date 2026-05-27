import React, { useState, useRef, useEffect } from "react";
import { useGeocoding } from "../hooks/useGeocoding";

const WarehouseSection = ({
  origin,
  setOriginPoint,
  isLocked,
  isPickingOrigin,
  setIsPickingOrigin,
  showNotification,
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, fetchSuggestions, reverseGeo, clearSuggestions } =
    useGeocoding();
  const containerRef = useRef(null);

  // Sync query when origin changes (including when cleared)
  useEffect(() => {
    if (origin?.name) {
      setQuery(origin.name);
    } else {
      setQuery("");
    }
  }, [origin]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 3) {
      fetchSuggestions(val);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  };

  const handleSelect = async (item) => {
    setQuery(item.display_name);
    setShowSuggestions(false);
    setOriginPoint(item.lat, item.lon, item.display_name);
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const name = await reverseGeo(latitude, longitude);
          setQuery(name);
          setOriginPoint(latitude, longitude, name);
          showNotification("Location detected successfully!", "success");
        },
        (err) => {
          showNotification("Unable to retrieve your location: " + err.message, "error");
        }
      );
    } else {
      showNotification("Geolocation is not supported by your browser.", "error");
    }
  };

  return (
    <div className="section">
      <div className="section-title">
        <div className="origin-indicator" />
        Warehouse / Starting Point
      </div>
      <div className="autocomplete-container" ref={containerRef}>
        <div className="input-row">
          <input
            type="search"
            placeholder="Search warehouse location..."
            value={query}
            onChange={handleInputChange}
            disabled={isLocked}
            style={{ flex: 1 }}
          />
          <button
            className={`btn btn-icon btn-secondary ${isPickingOrigin ? "pick-mode-active" : ""}`}
            onClick={() => setIsPickingOrigin(!isPickingOrigin)}
            disabled={isLocked}
            title="Pick on map"
          >
            🗺️
          </button>
          <button
            className="btn btn-icon btn-secondary"
            onClick={handleMyLocation}
            disabled={isLocked}
            title="My location"
          >
            📍
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onClick={() => handleSelect(item)}
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="section-hint">Click the map or search for a place</div>
      {origin && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)" }}>
          📍{" "}
          {origin.name ||
            `Set at ${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`}
        </div>
      )}
    </div>
  );
};

export default WarehouseSection;
