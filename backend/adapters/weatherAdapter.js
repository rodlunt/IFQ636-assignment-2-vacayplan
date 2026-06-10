// DESIGN PATTERN - ADAPTER
// Wraps the Open-Meteo HTTP API behind a common WeatherProvider interface so the
// rest of VacayPlan depends on a stable forecast contract, not on the vendor's
// request shape or response format.

// Target interface the application depends on.
class WeatherProvider {
    async getForecast() {
        throw new Error('WeatherProvider.getForecast must be implemented by a subclass');
    }
}

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Open-Meteo encodes conditions as integer WMO weather codes; map the codes we
// surface to a short human summary. Unmapped codes fall back to 'Unknown'.
const WEATHER_CODE_SUMMARIES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail',
};

const pick = (arr, i) => (Array.isArray(arr) ? arr[i] ?? null : null);
const toIsoDate = (value) => new Date(value).toISOString().slice(0, 10);

class OpenMeteoWeatherAdapter extends WeatherProvider {
    constructor({
        fetchFn = globalThis.fetch,
        geocodingUrl = OPEN_METEO_GEOCODING_URL,
        forecastUrl = OPEN_METEO_FORECAST_URL,
        timeoutMs = 8000,
    } = {}) {
        super();
        this.fetchFn = fetchFn;
        this.geocodingUrl = geocodingUrl;
        this.forecastUrl = forecastUrl;
        this.timeoutMs = timeoutMs;
    }

    async getForecast({ location, startDate, endDate } = {}) {
        const place = await this._geocode(location);

        const params = new URLSearchParams({
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum',
            timezone: 'auto',
        });
        if (startDate) params.set('start_date', toIsoDate(startDate));
        if (endDate) params.set('end_date', toIsoDate(endDate));

        let data;
        try {
            data = await this._getJson(`${this.forecastUrl}?${params.toString()}`, 'Weather');
        } catch (error) {
            // Open-Meteo only forecasts a limited window (roughly three months back
            // to about two weeks ahead). A trip outside that window has no forecast
            // yet — that is a normal empty result, not a vendor failure.
            if (/out of allowed range/i.test(error.message)) {
                return { location: place.resolvedName, daily: [] };
            }
            throw error;
        }

        return {
            location: place.resolvedName,
            daily: this._normaliseDaily(data.daily),
        };
    }

    // Adaptee call #1: resolve a free-text destination into the coordinates
    // Open-Meteo's forecast endpoint requires. The destination string often
    // carries a country or region (e.g. "Kyoto, Japan").
    async _geocode(location) {
        const segments = String(location || '').split(',').map((s) => s.trim()).filter(Boolean);
        const query = segments[0];
        if (!query) {
            throw new Error('A destination is required to look up the weather forecast');
        }
        const context = segments.slice(1);
        const url = `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=10`;
        const data = await this._getJson(url, 'Geocoding');
        const results = (data.results && data.results.length) ? data.results : null;
        if (!results) {
            throw new Error(`Could not find a location matching "${query}"`);
        }
        const chosen = this._pickBestMatch(results, context);
        return {
            latitude: chosen.latitude,
            longitude: chosen.longitude,
            resolvedName: this._formatPlaceName(chosen),
        };
    }

    _formatPlaceName(result) {
        return [result.name, result.admin1, result.country].filter(Boolean).join(', ');
    }

    _pickBestMatch(results, context) {
        if (!context.length) return results[0];
        const wanted = context.map((s) => s.toLowerCase());
        const matched = results.find((r) =>
            wanted.some((w) =>
                [r.country, r.country_code, r.admin1, r.admin2]
                    .filter(Boolean)
                    .some((field) => String(field).toLowerCase() === w),
            ),
        );
        return matched || results[0];
    }

    // Abort the request if the vendor does not respond within timeoutMs so a slow
    // or hanging Open-Meteo call cannot block the trip weather request indefinitely.
    async _getJson(url, label) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await this.fetchFn(url, { signal: controller.signal });
            if (!response.ok) {
                let reason = `${label} request failed (${response.status})`;
                try {
                    const body = await response.json();
                    if (body && body.reason) reason = body.reason;
                } catch (_) {
                    // response body was not JSON; keep the status-based message
                }
                throw new Error(reason);
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`${label} request timed out`);
            }
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }

    // Open-Meteo returns each metric as its own array aligned to daily.time by
    // index; the application wants one object per day, so transpose them.
    _normaliseDaily(daily) {
        if (!daily || !Array.isArray(daily.time)) return [];
        return daily.time.map((date, i) => ({
            date,
            tempMinC: pick(daily.temperature_2m_min, i),
            tempMaxC: pick(daily.temperature_2m_max, i),
            precipitationMm: pick(daily.precipitation_sum, i),
            summary: WEATHER_CODE_SUMMARIES[pick(daily.weathercode, i)] || 'Unknown',
        }));
    }
}

module.exports = {
    WeatherProvider,
    OpenMeteoWeatherAdapter,
    WEATHER_CODE_SUMMARIES,
};
