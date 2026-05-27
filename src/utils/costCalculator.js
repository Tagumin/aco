export const calculateCosts = (totalDistance, totalDuration, fuelConsumption, fuelPrice, otherCosts) => {
  const fuelUsed = totalDistance / fuelConsumption;
  const fuelCost = fuelUsed * fuelPrice;
  const totalCost = fuelCost + (parseFloat(otherCosts) || 0);
  const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

  return {
    fuelUsed,
    fuelCost,
    totalCost,
    costPerKm,
    totalDistance,
    totalDuration,
    fuelConsumption,
    fuelPrice,
  };
};
