import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">🍃</div>
        <div>
          <h1 className="header-title">Food Distribution Route Optimization</h1>
          <p className="header-subtitle">Ant Colony Optimization · OpenStreetMap · OSRM</p>
        </div>
      </div>
      <div className="badge">
        <span>🎯</span> SDG 2 · Zero Hunger
      </div>
    </header>
  );
};

export default Header;