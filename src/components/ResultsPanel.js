import React, { useState } from "react";
import { createPortal } from "react-dom";
import { formatNumber, formatCurrency, formatTime } from "../utils/helpers";

const ResultsPanel = ({
  results,
  highlightedSegment,
  setHighlightedSegment,
  isLocked,
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!results) {
    return (
      <div className="section">
        <div className="empty-state">
          <div className="empty-state-text">
            Configure your warehouse and destinations, then run the ACO
            algorithm to see the optimized route and cost breakdown here.
          </div>
        </div>
      </div>
    );
  }

  const {
    totalCost,
    totalDistance,
    totalDuration,
    fuelUsed,
    costPerKm,
    segments,
    orderedDestinations,
    otherCosts,
    fuelConsumption = 8,
    fuelPrice = 10000,
  } = results;

  const TableContent = ({ isModal = false }) => (
    <table className={isModal ? "modal-table" : "results-table"}>
      <colgroup>
        <col style={{ width: "8%" }} />
        <col style={{ width: "28%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "16%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>#</th>
          <th>Destination</th>
          <th>Distance</th>
          <th>Time</th>
          <th>Fuel</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        {segments.map((seg, idx) => {
          const segFuel = seg.distance / fuelConsumption;
          const segCost = segFuel * fuelPrice;
          const isHighlighted = highlightedSegment === idx;
          return (
            <tr
              key={idx}
              className={isHighlighted ? "highlighted" : ""}
              onMouseEnter={() => setHighlightedSegment(idx)}
              onMouseLeave={() => setHighlightedSegment(null)}
            >
              <td>{idx + 1}</td>
              <td>{seg.to.name || "Dest"}</td>
              <td>{formatNumber(seg.distance)} km</td>
              <td>{formatTime(seg.duration)}</td>
              <td>{formatNumber(segFuel, 2)} L</td>
              <td>{formatCurrency(segCost)}</td>
            </tr>
          );
        })}
        <tr className="total-row">
          <td colSpan={2}>
            <strong>Grand Total</strong>
          </td>
          <td>
            <strong>{formatNumber(totalDistance)} km</strong>
          </td>
          <td>
            <strong>{formatTime(totalDuration)}</strong>
          </td>
          <td>
            <strong>{formatNumber(fuelUsed, 2)} L</strong>
          </td>
          <td>
            <strong>{formatCurrency(totalCost - (otherCosts || 0))}</strong>
          </td>
        </tr>
        {otherCosts > 0 && (
          <tr className="total-row">
            <td colSpan={5}>
              <strong>Other Costs</strong>
            </td>
            <td>
              <strong>{formatCurrency(otherCosts)}</strong>
            </td>
          </tr>
        )}
        <tr
          className="total-row"
          style={{ background: "rgba(26,122,74,0.08)" }}
        >
          <td colSpan={5}>
            <strong>Total Cost</strong>
          </td>
          <td>
            <strong style={{ color: "var(--primary)" }}>
              {formatCurrency(totalCost)}
            </strong>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <>
      <div className="section">
        <div className="section-title">
          <span>🏆</span> Optimization Results
        </div>

        <div className="cost-card">
          <h3>Total Estimated Cost</h3>
          <div className="total-cost">{formatCurrency(totalCost)}</div>
          <div className="cost-stats">
            <div className="cost-stat">
              <div className="cost-stat-label">Distance</div>
              <div className="cost-stat-value">
                {formatNumber(totalDistance)} km
              </div>
            </div>
            <div className="cost-stat">
              <div className="cost-stat-label">Time</div>
              <div className="cost-stat-value">{formatTime(totalDuration)}</div>
            </div>
            <div className="cost-stat">
              <div className="cost-stat-label">Fuel</div>
              <div className="cost-stat-value">
                {formatNumber(fuelUsed, 2)} L
              </div>
            </div>
            <div className="cost-stat">
              <div className="cost-stat-label">Cost/km</div>
              <div className="cost-stat-value">{formatCurrency(costPerKm)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Optimized Route Order
          </div>
          <div className="route-order">
            <div className="route-step">
              <span>W</span>
              <span>Warehouse (Start)</span>
            </div>
            {orderedDestinations.map((dest, idx) => (
              <React.Fragment key={dest.id}>
                <div className="route-arrow">⬇️</div>
                <div
                  className="route-step"
                  onMouseEnter={() => setHighlightedSegment(idx)}
                  onMouseLeave={() => setHighlightedSegment(null)}
                >
                  <span style={{ background: dest.color }}>{idx + 1}</span>
                  <span>{dest.name || "Destination"}</span>
                </div>
              </React.Fragment>
            ))}
            <div className="route-arrow">⬇️</div>
            <div className="route-step">
              <span>W</span>
              <span>Warehouse (Return)</span>
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              Segment Details
            </div>
            <button className="expand-btn" onClick={() => setShowModal(true)}>
              View Full Table
            </button>
          </div>
          <TableContent isModal={false} />
        </div>
      </div>

      {showModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Segment Details - Full View</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <TableContent isModal={true} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ResultsPanel;
