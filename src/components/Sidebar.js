import React from "react";
import WarehouseSection from "./WarehouseSection";
import DestinationsSection from "./DestinationsSection";
import TravelCostSection from "./TravelCostSection";
import ACOSettingsSection from "./ACOSettingsSection";
import ActionArea from "./ActionArea";
import ResultsPanel from "./ResultsPanel";
import { useACO } from "../hooks/useACO";

const Sidebar = ({
  
  origin,
  setOriginPoint,
  destinations,
  addDestination,
  removeDestination,
  updateDestination,
  fuelPrice,
  setFuelPrice,
  fuelConsumption,
  setFuelConsumption,
  otherCosts,
  setOtherCosts,
  acoParams,
  setAcoParams,
  mode,
  setMode,
  isRunning,
  setIsRunning,
  isLocked,
  setIsLocked,
  progress,
  setProgress,
  bestDistance,
  setBestDistance,
  converged,
  setConverged,
  results,
  setResults,
  clearAll,
  showNotification,
  activeDestinationId,
  setActiveDestinationId,
  isPickingOrigin,
  setIsPickingOrigin,
  highlightedSegment,
  setHighlightedSegment,
  routePolylines,
  setRoutePolylines,
  mapRef,
}) => {
  const { runOptimization } = useACO();

  const handleRun = async () => {
    if (!origin) {
      showNotification(
        "Please set a warehouse / starting point first.",
        "error",
      );
      return;
    }
    const valid = destinations.filter((d) => d.lat !== null && d.lng !== null);
    if (valid.length === 0) {
      showNotification("Please add at least one valid destination.", "error");
      return;
    }
    if (valid.length < 1) {
      showNotification("At least 1 destination is required.", "error");
      return;
    }

    try {
      setIsRunning(true);
      setResults(null);
      setRoutePolylines([]);
      setProgress(0);
      setBestDistance(null);
      setConverged(false);

      await runOptimization(
        origin,
        valid,
        acoParams,
        fuelPrice,
        fuelConsumption,
        otherCosts,
        (update) => {
          setProgress(update.progress);
          if (update.bestDistance) setBestDistance(update.bestDistance);
        },
        (res) => {
          setResults(res);
          setIsLocked(true);
          setProgress(100);
          showNotification(
            `Route optimized! Total distance: ${res.totalDistance.toFixed(1)} km`,
            "success",
          );

          // Build route polylines with ACTUAL ROAD GEOMETRY from OSRM
          const polylines = res.segments.map((seg, idx) => ({
            from: [seg.from.lat, seg.from.lng],
            to: [seg.to.lat, seg.to.lng],
            color: seg.to.color || "#1a7a4a",
            order: idx,
            geometry: seg.geometry, // This is the actual road path from OSRM
          }));
          setRoutePolylines(polylines);

          // Fit map bounds
          setTimeout(() => {
            if (mapRef.current) {
              const map = mapRef.current;
              const bounds = [
                [origin.lat, origin.lng],
                ...valid.map((d) => [d.lat, d.lng]),
              ];
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }, 500);
        },
      );
    } catch (err) {
      showNotification("Optimization failed: " + err.message, "error");
      setIsRunning(false);
    } finally {
      // ✅ THIS IS THE FIX:
      setIsRunning(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        {results && (
          <div className="clear-banner">
            <div className="clear-banner-info">
              <span className="clear-banner-icon">✅</span>
              <span>Optimization complete</span>
            </div>
            <button className="btn btn-clear-banner" onClick={clearAll}>
              🗑️ Clear & Reset
            </button>
          </div>
        )}
        <WarehouseSection
          origin={origin}
          setOriginPoint={setOriginPoint}
          isLocked={isLocked || isRunning}
          isPickingOrigin={isPickingOrigin}
          setIsPickingOrigin={setIsPickingOrigin}
          showNotification={showNotification}
        />
        <DestinationsSection
          destinations={destinations}
          addDestination={addDestination}
          removeDestination={removeDestination}
          updateDestination={updateDestination}
          isLocked={isLocked || isRunning}
          activeDestinationId={activeDestinationId}
          setActiveDestinationId={setActiveDestinationId}
        />
        <TravelCostSection
          fuelPrice={fuelPrice}
          setFuelPrice={setFuelPrice}
          fuelConsumption={fuelConsumption}
          setFuelConsumption={setFuelConsumption}
          otherCosts={otherCosts}
          setOtherCosts={setOtherCosts}
          isLocked={isLocked || isRunning}
        />
        <ACOSettingsSection
          acoParams={acoParams}
          setAcoParams={setAcoParams}
          mode={mode}
          setMode={setMode}
          isLocked={isLocked || isRunning}
        />
        <ActionArea
          isRunning={isRunning}
          progress={progress}
          bestDistance={bestDistance}
          converged={converged}
          onRun={handleRun}
          onClear={clearAll}
          hasResults={!!results}
          isLocked={isLocked}
        />
        <ResultsPanel
          results={results}
          highlightedSegment={highlightedSegment}
          setHighlightedSegment={setHighlightedSegment}
          isLocked={isLocked}
          
        />
      </div>
    </aside>
  );
};

export default Sidebar;


