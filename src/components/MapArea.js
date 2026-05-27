import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const MapClickHandler = ({ onMapClick, isPickingOrigin, activeDestinationId }) => {
  useMapEvents({
    click: (e) => {
      if (isPickingOrigin || activeDestinationId !== null) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapController = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  return null;
};

const createCustomIcon = (color, label, isOrigin = false) => {
  const size = isOrigin ? 28 : 24;
  const html = `
    <div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: ${isOrigin ? 14 : 12}px;
      font-family: system-ui, sans-serif;
    ">${label}</div>
  `;
  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const MapArea = ({
  origin,
  destinations,
  validDestinations,
  results,
  isPickingOrigin,
  activeDestinationId,
  onMapClick,
  updateDestination,
  setOriginPoint,
  isLocked,
  highlightedSegment,
  setHighlightedSegment,
  routePolylines,
  setRoutePolylines,
  mapRef,
}) => {
  const defaultCenter = [-6.5744, 107.7592];
  const defaultZoom = 11;

  const handleMarkerDrag = useCallback((id, newLatLng, isOrigin = false) => {
    if (isLocked) return;
    if (isOrigin) {
      setOriginPoint(newLatLng.lat, newLatLng.lng, origin?.name);
    } else {
      updateDestination(id, { lat: newLatLng.lat, lng: newLatLng.lng });
    }
  }, [isLocked, origin, setOriginPoint, updateDestination]);

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController mapRef={mapRef} />
        <MapClickHandler
          onMapClick={onMapClick}
          isPickingOrigin={isPickingOrigin}
          activeDestinationId={activeDestinationId}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin Marker */}
        {origin && (
          <Marker
            position={[origin.lat, origin.lng]}
            icon={createCustomIcon('#1a7a4a', 'W', true)}
            draggable={!isLocked}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(null, e.target.getLatLng(), true),
            }}
          >
            <Popup>
              <strong>Warehouse</strong><br />
              {origin.name || `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`}
            </Popup>
          </Marker>
        )}

        {/* Destination Markers */}
        {validDestinations.map((dest) => {
          const originalIdx = destinations.findIndex((d) => d.id === dest.id);
          const displayNum = originalIdx !== -1 ? originalIdx + 1 : "?";
          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createCustomIcon(dest.color, String(displayNum))}
              draggable={!isLocked}
              eventHandlers={{
                dragend: (e) => handleMarkerDrag(dest.id, e.target.getLatLng()),
              }}
            >
              <Popup>
                <strong>Destination {displayNum}</strong><br />
                {dest.name || `${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)}`}
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polylines - USE ACTUAL ROAD GEOMETRY */}
        {routePolylines.map((poly, idx) => {
          const isHighlighted = highlightedSegment === idx;
          const isDimmed = highlightedSegment !== null && !isHighlighted;
          // poly.geometry is array of [lat, lng] from OSRM decoded polyline
          const positions = poly.geometry || [poly.from, poly.to];
          return (
            <Polyline
              key={idx}
              positions={positions}
              pathOptions={{
                color: poly.color,
                weight: isHighlighted ? 6 : 4,
                opacity: isDimmed ? 0.3 : 0.85,
                dashArray: null,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                mouseover: () => setHighlightedSegment(idx),
                mouseout: () => setHighlightedSegment(null),
              }}
            />
          );
        })}
      </MapContainer>

      <div className="map-info-box">
        {(isPickingOrigin || activeDestinationId !== null)
          ? 'Click anywhere on the map to set the location'
          : 'Click the map to set a location (use pick buttons in sidebar)'}
      </div>
    </div>
  );
};

export default MapArea;