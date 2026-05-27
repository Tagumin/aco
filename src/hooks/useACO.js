import { useState, useCallback, useRef } from 'react';
import { ACOOptimizer } from '../utils/acoAlgorithm';
import { getDistanceMatrix, getRouteGeometry } from '../utils/routing';
import { calculateCosts } from '../utils/costCalculator';

export const useACO = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bestDistance, setBestDistance] = useState(null);
  const [converged, setConverged] = useState(false);
  const abortRef = useRef(false);

  const runOptimization = useCallback(async (
    origin,
    destinations,
    acoParams,
    fuelPrice,
    fuelConsumption,
    otherCosts,
    onProgress,
    onComplete
  ) => {
    abortRef.current = false;
    setIsRunning(true);
    setProgress(0);
    setBestDistance(null);
    setConverged(false);

    try {
      const points = [
        { lat: origin.lat, lng: origin.lng },
        ...destinations.map(d => ({ lat: d.lat, lng: d.lng }))
      ];

      onProgress?.({ progress: 5, bestDistance: null, message: 'Building distance matrix...' });

      const { distances, durations } = await getDistanceMatrix(points);

      if (abortRef.current) return;

      onProgress?.({ progress: 10, bestDistance: null, message: 'Initializing ants...' });

      const optimizer = new ACOOptimizer(distances, acoParams);
      const batchSize = 5;
      let stagnationCount = 0;
      let lastBest = Infinity;

      for (let i = 0; i < acoParams.nIter; i += batchSize) {
        if (abortRef.current) return;

        for (let b = 0; b < batchSize && i + b < acoParams.nIter; b++) {
          optimizer.runIteration();
        }

        const currentProgress = 10 + ((i + batchSize) / acoParams.nIter) * 70;
        const currentBest = optimizer.bestLength;

        if (currentBest === lastBest) {
          stagnationCount++;
        } else {
          stagnationCount = 0;
          lastBest = currentBest;
        }

        setBestDistance(currentBest);
        setProgress(Math.min(currentProgress, 80));
        onProgress?.({
          progress: Math.min(currentProgress, 80),
          bestDistance: currentBest,
          message: `Iteration ${Math.min(i + batchSize, acoParams.nIter)}/${acoParams.nIter} · Best: ${currentBest.toFixed(1)} km`
        });

        if (stagnationCount >= 10) {
          setConverged(true);
          break;
        }

        await new Promise(r => setTimeout(r, 10));
      }

      if (abortRef.current) return;

      setProgress(85);
      onProgress?.({ progress: 85, bestDistance: optimizer.bestLength, message: 'Fetching actual road routes...' });

      const tour = optimizer.bestTour;
      const segments = [];
      let totalDistance = 0;
      let totalDuration = 0;

      // Fetch actual road geometries for each segment
      for (let i = 0; i < tour.length - 1; i++) {
        const fromIdx = tour[i];
        const toIdx = tour[i + 1];
        const fromPoint = fromIdx === 0 ? origin : destinations[fromIdx - 1];
        const toPoint = toIdx === 0 ? origin : destinations[toIdx - 1];

        const geometryResult = await getRouteGeometry(
          fromPoint.lat, fromPoint.lng,
          toPoint.lat, toPoint.lng
        );

        const dist = geometryResult.distance;
        const dur = geometryResult.duration;
        totalDistance += dist;
        totalDuration += dur;

        segments.push({
          from: fromPoint,
          to: toPoint,
          fromIdx,
          toIdx,
          distance: dist,
          duration: dur,
          order: i + 1,
          geometry: geometryResult.coords, // Actual road path coordinates
        });

        // Small delay to prevent rate limiting
        if (i < tour.length - 2) await new Promise(r => setTimeout(r, 100));
      }

      if (abortRef.current) return;

      setProgress(95);
      onProgress?.({ progress: 95, bestDistance: optimizer.bestLength, message: 'Calculating costs...' });

      const costs = calculateCosts(totalDistance, totalDuration, fuelConsumption, fuelPrice, otherCosts);

      const orderedDestinations = [];
      for (let i = 1; i < tour.length - 1; i++) {
        const destIdx = tour[i] - 1;
        orderedDestinations.push({
          ...destinations[destIdx],
          visitOrder: i,
        });
      }

      setProgress(100);
      onProgress?.({ progress: 100, message: 'Optimization complete!' });

      const results = {
        tour,
        segments,
        orderedDestinations,
        totalDistance,
        totalDuration,
        ...costs,
        iterations: optimizer.history.length,
        converged: stagnationCount >= 10,
      };

      onComplete?.(results);
    } catch (err) {
      console.error('ACO optimization failed:', err);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return {
    isRunning,
    progress,
    bestDistance,
    converged,
    runOptimization,
    abort,
  };
};
