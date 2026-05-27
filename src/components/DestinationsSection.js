import React, { useState, useRef, useEffect } from "react";
import { useGeocoding } from "../hooks/useGeocoding";

const DestinationItem = ({
  dest,
  index,
  isLocked,
  onUpdate,
  onRemove,
  isActive,
  setActive,
}) => {
  const [query, setQuery] = useState(dest.name || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, fetchSuggestions, clearSuggestions } = useGeocoding();
  const containerRef = useRef(null);

  // Sync query when dest.name changes externally (including when cleared)
  useEffect(() => {
    if (dest.name) {
      setQuery(dest.name);
    } else {
      setQuery("");
    }
  }, [dest.name]);

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
    onUpdate(dest.id, { name: val });
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
    onUpdate(dest.id, {
      lat: item.lat,
      lng: item.lon,
      name: item.display_name,
    });
  };

  return (
    <div className="destination-item" ref={containerRef}>
      <div className="destination-number" style={{ background: dest.color }}>
        {index + 1}
      </div>
      <div className="destination-inputs">
        <div className="input-row">
          <input
            type="search"
            placeholder={`Destination ${index + 1}...`}
            value={query}
            onChange={handleInputChange}
            disabled={isLocked}
            style={{ flex: 1 }}
          />
          <button
            className={`btn btn-icon btn-secondary ${isActive ? "pick-mode-active" : ""}`}
            onClick={() => setActive(isActive ? null : dest.id)}
            disabled={isLocked}
            title="Pick on map"
          >
            🗺️
          </button>
          <button
            className="btn btn-icon btn-danger"
            onClick={() => onRemove(dest.id)}
            disabled={isLocked}
            title="Remove"
          >
            ✕
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
        {dest.lat && dest.name && (
          <div style={{ fontSize: 11, color: "var(--text-light)" }}>
            🗺️{" "}
            {dest.name.length > 40
              ? dest.name.substring(0, 40) + "..."
              : dest.name}
          </div>
        )}
        {dest.lat && !dest.name && (
          <div style={{ fontSize: 11, color: "var(--text-light)" }}>
            Set at {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
          </div>
        )}
        {query.trim().length >= 3 && (!dest.lat || !dest.lng) && (
          <div style={{ fontSize: 11, color: "#e74c3c", marginTop: 4 }}>
            ⚠️ Select from suggestions or pick on the map to set location
          </div>
        )}
      </div>
    </div>
  );
};

const DestinationsSection = ({
  destinations,
  addDestination,
  removeDestination,
  updateDestination,
  isLocked,
  activeDestinationId,
  setActiveDestinationId,
}) => {
  return (
    <div className="section">
      <div className="section-title">
        <span>🗺️</span> Delivery Destinations
      </div>
      {destinations.map((dest, idx) => (
        <DestinationItem
          key={dest.id}
          dest={dest}
          index={idx}
          isLocked={isLocked}
          onUpdate={updateDestination}
          onRemove={removeDestination}
          isActive={activeDestinationId === dest.id}
          setActive={setActiveDestinationId}
        />
      ))}
      <button
        className="btn btn-secondary"
        onClick={addDestination}
        disabled={isLocked}
        style={{ width: "100%", marginTop: 8 }}
      >
        + Add Destination
      </button>
      <div className="section-hint">
        ACO will determine the optimal visit order via ant pheromones
      </div>
    </div>
  );
};

export default DestinationsSection;
