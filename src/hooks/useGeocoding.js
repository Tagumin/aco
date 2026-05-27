import { useState, useCallback, useRef } from 'react';
import { searchLocation, reverseGeocode } from '../utils/geocoding';
import { debounce } from '../utils/helpers';

export const useGeocoding = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const results = await searchLocation(query);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  const reverseGeo = useCallback(async (lat, lng) => {
    try {
      return await reverseGeocode(lat, lng);
    } catch (err) {
      console.error(err);
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, loading, fetchSuggestions, reverseGeo, clearSuggestions };
};
