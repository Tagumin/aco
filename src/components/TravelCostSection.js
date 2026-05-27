import React from "react";
import HardenedNumberInput from "./HardenedNumberInput";

const TravelCostSection = ({
  fuelPrice,
  setFuelPrice,
  fuelConsumption,
  setFuelConsumption,
  otherCosts,
  setOtherCosts,
  isLocked,
}) => {
  const costParams = [
    {
      key: "fuelPrice",
      label: "Fuel Price",
      value: fuelPrice,
      onChange: setFuelPrice,
      unit: "Rp/liter",
      hint: "Cost per liter",
      min: 0,
      max: 100000,
    },
    {
      key: "fuelConsumption",
      label: "Fuel Consumption",
      value: fuelConsumption,
      onChange: setFuelConsumption,
      unit: "km/liter",
      hint: "Vehicle efficiency",
      min: 0.1,
      max: 100,
      step: 0.1,
    },
    {
      key: "otherCosts",
      label: "Other Costs",
      value: otherCosts,
      onChange: setOtherCosts,
      unit: "Rp",
      hint: "Toll, parking, etc.",
      min: 0,
      max: 10000000,
      fullWidth: true,
    },
  ];

  return (
    <div className="section">
      <div className="section-title">
        <span>⛽</span> Travel Cost
      </div>
      <div className="cost-params-table">
        {costParams.map((param) => (
          <div key={param.key} className="cost-param-row">
            <div className="cost-param-label">
              <div className="cost-param-name">{param.label}</div>
              <div className="cost-param-hint">{param.hint}</div>
            </div>
            <div className="cost-param-input">
              <HardenedNumberInput
                value={param.value}
                onChange={param.onChange}
                disabled={isLocked}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                className="cost-input"
              />
              <div className="cost-param-unit">{param.unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelCostSection;
