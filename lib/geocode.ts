// City geocoding: fuzzy match against a bundled city list, with Nominatim fallback.

interface CityEntry {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// Top ~400 world cities with coordinates (compact inline dataset)
const CITIES: CityEntry[] = [
  { city: "New York", country: "US", lat: 40.7128, lng: -74.006 },
  { city: "Los Angeles", country: "US", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "US", lat: 41.8781, lng: -87.6298 },
  { city: "Houston", country: "US", lat: 29.7604, lng: -95.3698 },
  { city: "Phoenix", country: "US", lat: 33.4484, lng: -112.074 },
  { city: "Philadelphia", country: "US", lat: 39.9526, lng: -75.1652 },
  { city: "San Antonio", country: "US", lat: 29.4241, lng: -98.4936 },
  { city: "San Diego", country: "US", lat: 32.7157, lng: -117.1611 },
  { city: "Dallas", country: "US", lat: 32.7767, lng: -96.797 },
  { city: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194 },
  { city: "Seattle", country: "US", lat: 47.6062, lng: -122.3321 },
  { city: "Denver", country: "US", lat: 39.7392, lng: -104.9903 },
  { city: "Boston", country: "US", lat: 42.3601, lng: -71.0589 },
  { city: "Nashville", country: "US", lat: 36.1627, lng: -86.7816 },
  { city: "Austin", country: "US", lat: 30.2672, lng: -97.7431 },
  { city: "Portland", country: "US", lat: 45.5051, lng: -122.675 },
  { city: "Las Vegas", country: "US", lat: 36.1699, lng: -115.1398 },
  { city: "Miami", country: "US", lat: 25.7617, lng: -80.1918 },
  { city: "Atlanta", country: "US", lat: 33.749, lng: -84.388 },
  { city: "Minneapolis", country: "US", lat: 44.9778, lng: -93.265 },
  { city: "London", country: "GB", lat: 51.5074, lng: -0.1278 },
  { city: "Manchester", country: "GB", lat: 53.4808, lng: -2.2426 },
  { city: "Birmingham", country: "GB", lat: 52.4862, lng: -1.8904 },
  { city: "Leeds", country: "GB", lat: 53.8008, lng: -1.5491 },
  { city: "Edinburgh", country: "GB", lat: 55.9533, lng: -3.1883 },
  { city: "Paris", country: "FR", lat: 48.8566, lng: 2.3522 },
  { city: "Lyon", country: "FR", lat: 45.748, lng: 4.8467 },
  { city: "Marseille", country: "FR", lat: 43.2965, lng: 5.3698 },
  { city: "Berlin", country: "DE", lat: 52.52, lng: 13.405 },
  { city: "Munich", country: "DE", lat: 48.1351, lng: 11.582 },
  { city: "Hamburg", country: "DE", lat: 53.5753, lng: 10.0153 },
  { city: "Frankfurt", country: "DE", lat: 50.1109, lng: 8.6821 },
  { city: "Cologne", country: "DE", lat: 50.938, lng: 6.9603 },
  { city: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041 },
  { city: "Rotterdam", country: "NL", lat: 51.9244, lng: 4.4777 },
  { city: "Brussels", country: "BE", lat: 50.8503, lng: 4.3517 },
  { city: "Zurich", country: "CH", lat: 47.3769, lng: 8.5417 },
  { city: "Geneva", country: "CH", lat: 46.2044, lng: 6.1432 },
  { city: "Vienna", country: "AT", lat: 48.2082, lng: 16.3738 },
  { city: "Stockholm", country: "SE", lat: 59.3293, lng: 18.0686 },
  { city: "Copenhagen", country: "DK", lat: 55.6761, lng: 12.5683 },
  { city: "Oslo", country: "NO", lat: 59.9139, lng: 10.7522 },
  { city: "Helsinki", country: "FI", lat: 60.1699, lng: 24.9384 },
  { city: "Lisbon", country: "PT", lat: 38.7223, lng: -9.1393 },
  { city: "Madrid", country: "ES", lat: 40.4168, lng: -3.7038 },
  { city: "Barcelona", country: "ES", lat: 41.3851, lng: 2.1734 },
  { city: "Rome", country: "IT", lat: 41.9028, lng: 12.4964 },
  { city: "Milan", country: "IT", lat: 45.4642, lng: 9.19 },
  { city: "Warsaw", country: "PL", lat: 52.2297, lng: 21.0122 },
  { city: "Prague", country: "CZ", lat: 50.0755, lng: 14.4378 },
  { city: "Budapest", country: "HU", lat: 47.4979, lng: 19.0402 },
  { city: "Bucharest", country: "RO", lat: 44.4268, lng: 26.1025 },
  { city: "Athens", country: "GR", lat: 37.9838, lng: 23.7275 },
  { city: "Istanbul", country: "TR", lat: 41.0082, lng: 28.9784 },
  { city: "Ankara", country: "TR", lat: 39.9334, lng: 32.8597 },
  { city: "Kyiv", country: "UA", lat: 50.4501, lng: 30.5234 },
  { city: "Moscow", country: "RU", lat: 55.7558, lng: 37.6173 },
  { city: "St. Petersburg", country: "RU", lat: 59.9343, lng: 30.3351 },
  { city: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708 },
  { city: "Abu Dhabi", country: "AE", lat: 24.4539, lng: 54.3773 },
  { city: "Riyadh", country: "SA", lat: 24.7136, lng: 46.6753 },
  { city: "Tel Aviv", country: "IL", lat: 32.0853, lng: 34.7818 },
  { city: "Jerusalem", country: "IL", lat: 31.7683, lng: 35.2137 },
  { city: "Cairo", country: "EG", lat: 30.0444, lng: 31.2357 },
  { city: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792 },
  { city: "Nairobi", country: "KE", lat: -1.2921, lng: 36.8219 },
  { city: "Johannesburg", country: "ZA", lat: -26.2041, lng: 28.0473 },
  { city: "Cape Town", country: "ZA", lat: -33.9249, lng: 18.4241 },
  { city: "Casablanca", country: "MA", lat: 33.5731, lng: -7.5898 },
  { city: "Accra", country: "GH", lat: 5.6037, lng: -0.187 },
  { city: "Mumbai", country: "IN", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", country: "IN", lat: 28.7041, lng: 77.1025 },
  { city: "Bangalore", country: "IN", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", country: "IN", lat: 17.385, lng: 78.4867 },
  { city: "Chennai", country: "IN", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", country: "IN", lat: 22.5726, lng: 88.3639 },
  { city: "Pune", country: "IN", lat: 18.5204, lng: 73.8567 },
  { city: "Ahmedabad", country: "IN", lat: 23.0225, lng: 72.5714 },
  { city: "Beijing", country: "CN", lat: 39.9042, lng: 116.4074 },
  { city: "Shanghai", country: "CN", lat: 31.2304, lng: 121.4737 },
  { city: "Shenzhen", country: "CN", lat: 22.5431, lng: 114.0579 },
  { city: "Guangzhou", country: "CN", lat: 23.1291, lng: 113.2644 },
  { city: "Chengdu", country: "CN", lat: 30.5728, lng: 104.0668 },
  { city: "Hangzhou", country: "CN", lat: 30.2741, lng: 120.1551 },
  { city: "Wuhan", country: "CN", lat: 30.5928, lng: 114.3055 },
  { city: "Hong Kong", country: "HK", lat: 22.3193, lng: 114.1694 },
  { city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503 },
  { city: "Osaka", country: "JP", lat: 34.6937, lng: 135.5023 },
  { city: "Seoul", country: "KR", lat: 37.5665, lng: 126.978 },
  { city: "Busan", country: "KR", lat: 35.1796, lng: 129.0756 },
  { city: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198 },
  { city: "Bangkok", country: "TH", lat: 13.7563, lng: 100.5018 },
  { city: "Kuala Lumpur", country: "MY", lat: 3.139, lng: 101.6869 },
  { city: "Jakarta", country: "ID", lat: -6.2088, lng: 106.8456 },
  { city: "Manila", country: "PH", lat: 14.5995, lng: 120.9842 },
  { city: "Ho Chi Minh City", country: "VN", lat: 10.8231, lng: 106.6297 },
  { city: "Hanoi", country: "VN", lat: 21.0285, lng: 105.8542 },
  { city: "Taipei", country: "TW", lat: 25.033, lng: 121.5654 },
  { city: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", country: "AU", lat: -37.8136, lng: 144.9631 },
  { city: "Brisbane", country: "AU", lat: -27.4698, lng: 153.0251 },
  { city: "Perth", country: "AU", lat: -31.9505, lng: 115.8605 },
  { city: "Auckland", country: "NZ", lat: -36.8509, lng: 174.7645 },
  { city: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "CA", lat: 49.2827, lng: -123.1207 },
  { city: "Montreal", country: "CA", lat: 45.5017, lng: -73.5673 },
  { city: "Calgary", country: "CA", lat: 51.0447, lng: -114.0719 },
  { city: "Ottawa", country: "CA", lat: 45.4215, lng: -75.6972 },
  { city: "Mexico City", country: "MX", lat: 19.4326, lng: -99.1332 },
  { city: "Guadalajara", country: "MX", lat: 20.6597, lng: -103.3496 },
  { city: "Monterrey", country: "MX", lat: 25.6866, lng: -100.3161 },
  { city: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333 },
  { city: "Rio de Janeiro", country: "BR", lat: -22.9068, lng: -43.1729 },
  { city: "Brasília", country: "BR", lat: -15.7975, lng: -47.8919 },
  { city: "Buenos Aires", country: "AR", lat: -34.6037, lng: -58.3816 },
  { city: "Lima", country: "PE", lat: -12.0464, lng: -77.0428 },
  { city: "Bogotá", country: "CO", lat: 4.711, lng: -74.0721 },
  { city: "Santiago", country: "CL", lat: -33.4489, lng: -70.6693 },
  { city: "Caracas", country: "VE", lat: 10.4806, lng: -66.9036 },
  { city: "Lahore", country: "PK", lat: 31.5204, lng: 74.3587 },
  { city: "Karachi", country: "PK", lat: 24.8607, lng: 67.0011 },
  { city: "Dhaka", country: "BD", lat: 23.8103, lng: 90.4125 },
  { city: "Colombo", country: "LK", lat: 6.9271, lng: 79.8612 },
  { city: "Kathmandu", country: "NP", lat: 27.7172, lng: 85.324 },
  { city: "Almaty", country: "KZ", lat: 43.2551, lng: 76.9126 },
  { city: "Tashkent", country: "UZ", lat: 41.2995, lng: 69.2401 },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function lookupCity(
  city: string,
  country?: string
): { lat: number; lng: number } | null {
  const normCity = normalize(city);
  const normCountry = country ? normalize(country) : null;

  // Exact match first
  for (const entry of CITIES) {
    if (normalize(entry.city) === normCity) {
      if (!normCountry || normalize(entry.country) === normCountry) {
        return { lat: entry.lat, lng: entry.lng };
      }
    }
  }

  // Partial match (city name starts with query)
  for (const entry of CITIES) {
    if (normalize(entry.city).startsWith(normCity)) {
      return { lat: entry.lat, lng: entry.lng };
    }
  }

  return null;
}

export async function geocodeCity(
  city: string,
  country?: string
): Promise<{ lat: number; lng: number } | null> {
  // Try bundled list first
  const local = lookupCity(city, country);
  if (local) return local;

  // Fallback: Nominatim public API
  try {
    const q = country ? `${city}, ${country}` : city;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "dot-collector/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
