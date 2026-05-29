import React from 'react';

const ActionArea = ({ isRunning, progress, bestDistance, converged, onRun, onClear, hasResults, isLocked }) => {
  return (
    <div className="section">
      {(isRunning || progress > 0) && (
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-info">
            <span>{isRunning ? 'Optimizing route...' : progress === 100 ? 'Complete' : 'Ready'}</span>
            <span>{bestDistance ? `Best: ${bestDistance.toFixed(1)} km` : ''}</span>
          </div>
        </div>
      )}

      {converged && (
        <div className="convergence-box">
          ✅ Convergence detected! The algorithm found a stable optimal route.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={onRun}
          disabled={isRunning || isLocked}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isRunning ? (
            <>
              <div className="spinner" /> Running ACO...
            </>
          ) : (
            <>🐜 Run ACO</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionArea;