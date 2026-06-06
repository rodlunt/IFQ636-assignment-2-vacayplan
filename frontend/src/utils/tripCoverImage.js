const KNOWN_DESTINATIONS = {
  bali: '/trip-covers/bali.webp',
  tokyo: '/trip-covers/tokyo.webp',
  paris: '/trip-covers/paris.webp',
  tahiti: '/trip-covers/tahiti.webp',
  'new york': '/trip-covers/new-york.webp',
  london: '/trip-covers/london.webp',
  sydney: '/trip-covers/sydney.webp',
  bangkok: '/trip-covers/bangkok.webp',
  reykjavik: '/trip-covers/reykjavik.webp',
};
const GENERIC = '/trip-covers/generic.webp';

export function tripCoverImage(destination) {
  if (!destination) return GENERIC;
  const key = destination.toLowerCase().split(',')[0].trim();
  return KNOWN_DESTINATIONS[key] || GENERIC;
}

export { GENERIC as TRIP_COVER_FALLBACK };
