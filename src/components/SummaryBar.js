import React from 'react';
import { formatNumber, formatCurrency, formatTime } from '../utils/helpers';

const SummaryBar = ({ results, origin, validDestinations }) => {
  const hasData = results || (origin && validDestinations.length > 0);

  const distance = results ? results.totalDistance : 0;
  const duration = results ? results.totalDuration : 0;
  const fuel = results ? results.fuelUsed : 0;
  const cost = results ? results.totalCost : 0;

  return (
    <div className="summary-bar">
      <div className="summary-item">
        <span className="summary-label">Total Distance</span>
        <span className="summary-value">{hasData ? `${formatNumber(distance)} km` : '—'}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Est. Time</span>
        <span className="summary-value">{hasData ? formatTime(duration) : '—'}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Fuel Used</span>
        <span className="summary-value">{hasData ? `${formatNumber(fuel, 2)} L` : '—'}</span>
      </div>
      <div className="summary-item highlighted">
        <span className="summary-label">Total Cost</span>
        <span className="summary-value">{hasData ? formatCurrency(cost) : '—'}</span>
      </div>
    </div>
  );
};

export default SummaryBar;