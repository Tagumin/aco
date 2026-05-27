import { useState, useCallback } from "react";
import { getRoadDistance, getDistanceMatrix } from "../utils/routing";

export const useRouting = () => {
  const [loading, setLoading] = useState(false);

  const fetchRoute = useCallback(async (from, to) => {
    setLoading(true);
    try {
      return await getRoadDistance(from.lat, from.lng, to.lat, to.lng);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatrix = useCallback(async (points) => {
    setLoading(true);
    try {
      return await getDistanceMatrix(points);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchRoute, fetchMatrix };
};
