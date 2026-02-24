/**
 * Weather Service
 * Uses Open-Meteo API (free, no API key required)
 * Caches results for 30 minutes in chrome.storage.local
 */

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  locationName: string;
  high: number;
  low: number;
  timestamp: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

const CACHE_KEY = 'sparkly_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const LOCATION_CACHE_KEY = 'sparkly_weather_location';

// WMO Weather interpretation codes -> readable condition
export const WEATHER_CONDITIONS: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear Sky', icon: 'clear' },
  1: { label: 'Mainly Clear', icon: 'clear' },
  2: { label: 'Partly Cloudy', icon: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'cloudy' },
  45: { label: 'Foggy', icon: 'fog' },
  48: { label: 'Icy Fog', icon: 'fog' },
  51: { label: 'Light Drizzle', icon: 'drizzle' },
  53: { label: 'Drizzle', icon: 'drizzle' },
  55: { label: 'Heavy Drizzle', icon: 'drizzle' },
  56: { label: 'Freezing Drizzle', icon: 'drizzle' },
  57: { label: 'Heavy Freezing Drizzle', icon: 'drizzle' },
  61: { label: 'Light Rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy Rain', icon: 'heavy-rain' },
  66: { label: 'Freezing Rain', icon: 'rain' },
  67: { label: 'Heavy Freezing Rain', icon: 'heavy-rain' },
  71: { label: 'Light Snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy Snow', icon: 'heavy-snow' },
  77: { label: 'Snow Grains', icon: 'snow' },
  80: { label: 'Light Showers', icon: 'rain' },
  81: { label: 'Showers', icon: 'rain' },
  82: { label: 'Heavy Showers', icon: 'heavy-rain' },
  85: { label: 'Snow Showers', icon: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'heavy-snow' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail', icon: 'thunderstorm' },
  99: { label: 'Heavy Thunderstorm', icon: 'thunderstorm' },
};

export function getWeatherCondition(code: number): { label: string; icon: string } {
  return WEATHER_CONDITIONS[code] || { label: 'Unknown', icon: 'clear' };
}

/**
 * Get user's geolocation via browser API
 */
export function getGeolocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    // Try cached location first
    try {
      chrome.storage.local.get([LOCATION_CACHE_KEY], (result) => {
        const cached = result[LOCATION_CACHE_KEY];
        if (cached && cached.latitude && cached.longitude) {
          resolve(cached);
          // Still update in background
          updateLocationInBackground();
          return;
        }
        // No cache, must get fresh location
        requestFreshLocation(resolve, reject);
      });
    } catch {
      requestFreshLocation(resolve, reject);
    }
  });
}

function requestFreshLocation(
  resolve: (loc: GeoLocation) => void,
  reject: (err: Error) => void
) {
  if (!navigator.geolocation) {
    reject(new Error('Geolocation not supported'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const loc: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      try {
        chrome.storage.local.set({ [LOCATION_CACHE_KEY]: loc });
      } catch {}
      resolve(loc);
    },
    (error) => {
      reject(new Error(`Geolocation error: ${error.message}`));
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

function updateLocationInBackground() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const loc: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      try {
        chrome.storage.local.set({ [LOCATION_CACHE_KEY]: loc });
      } catch {}
    },
    () => {} // silently ignore
  );
}

/**
 * Reverse geocode coordinates to a city name using Open-Meteo geocoding
 */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'Your Location';
  } catch {
    return 'Your Location';
  }
}

/**
 * Fetch weather from Open-Meteo API
 */
export async function fetchWeather(
  location: GeoLocation,
  unit: 'celsius' | 'fahrenheit' = 'celsius'
): Promise<WeatherData> {
  // Check cache first
  try {
    const result = await new Promise<any>((resolve) => {
      chrome.storage.local.get([CACHE_KEY], (r) => resolve(r));
    });
    const cached = result[CACHE_KEY] as WeatherData | undefined;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
  } catch {}

  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'kmh';

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=${tempUnit}` +
    `&wind_speed_unit=${windUnit}` +
    `&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  const locationName = await reverseGeocode(location.latitude, location.longitude);

  const weather: WeatherData = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    locationName,
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    timestamp: Date.now(),
  };

  // Cache the result
  try {
    chrome.storage.local.set({ [CACHE_KEY]: weather });
  } catch {}

  return weather;
}

/**
 * Clear weather cache (used when unit changes)
 */
export function clearWeatherCache(): void {
  try {
    chrome.storage.local.remove(CACHE_KEY);
  } catch {}
}
