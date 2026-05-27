const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const BIGDATACLOUD_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export const searchLocation = async (query, countrycodes = 'id') => {
  if (!query || query.length < 3) return [];
  try {
    const url = `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countrycodes}&limit=5`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!response.ok) throw new Error('Nominatim error');
    const data = await response.json();
    return data.map(item => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!response.ok) throw new Error('Nominatim reverse error');
    const data = await response.json();
    if (data.display_name) return data.display_name;
  } catch (err) {
    console.warn('Nominatim reverse failed, trying fallback:', err);
  }

  try {
    const url = `${BIGDATACLOUD_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('BigDataCloud error');
    const data = await response.json();
    const parts = [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean);
    return parts.join(', ') || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
