import { tripCoverImage, TRIP_COVER_FALLBACK } from './tripCoverImage';

describe('tripCoverImage', () => {
  it('returns the generic fallback when destination is null/undefined/empty', () => {
    expect(tripCoverImage(null)).toBe(TRIP_COVER_FALLBACK);
    expect(tripCoverImage(undefined)).toBe(TRIP_COVER_FALLBACK);
    expect(tripCoverImage('')).toBe(TRIP_COVER_FALLBACK);
  });

  it('resolves a known single-word destination case-insensitively', () => {
    expect(tripCoverImage('Bali')).toBe('/trip-covers/bali.webp');
    expect(tripCoverImage('BALI')).toBe('/trip-covers/bali.webp');
    expect(tripCoverImage('bali')).toBe('/trip-covers/bali.webp');
  });

  it('strips a trailing country / state after a comma', () => {
    expect(tripCoverImage('Bali, Indonesia')).toBe('/trip-covers/bali.webp');
    expect(tripCoverImage('Tokyo, Japan')).toBe('/trip-covers/tokyo.webp');
    expect(tripCoverImage('Sydney, Australia')).toBe('/trip-covers/sydney.webp');
  });

  it('handles multi-word destinations (e.g. New York)', () => {
    expect(tripCoverImage('New York')).toBe('/trip-covers/new-york.webp');
    expect(tripCoverImage('new york, USA')).toBe('/trip-covers/new-york.webp');
    expect(tripCoverImage('  New York  ')).toBe('/trip-covers/new-york.webp');
  });

  it('returns the generic fallback for an unknown destination', () => {
    expect(tripCoverImage('Atlantis')).toBe(TRIP_COVER_FALLBACK);
    expect(tripCoverImage('Mars, Solar System')).toBe(TRIP_COVER_FALLBACK);
  });

  it('resolves every known destination in the catalogue', () => {
    const cases = [
      ['Bali', '/trip-covers/bali.webp'],
      ['Tokyo', '/trip-covers/tokyo.webp'],
      ['Paris', '/trip-covers/paris.webp'],
      ['Tahiti', '/trip-covers/tahiti.webp'],
      ['New York', '/trip-covers/new-york.webp'],
      ['London', '/trip-covers/london.webp'],
      ['Sydney', '/trip-covers/sydney.webp'],
      ['Bangkok', '/trip-covers/bangkok.webp'],
      ['Reykjavik', '/trip-covers/reykjavik.webp'],
    ];
    for (const [input, expected] of cases) {
      expect(tripCoverImage(input)).toBe(expected);
    }
  });
});
