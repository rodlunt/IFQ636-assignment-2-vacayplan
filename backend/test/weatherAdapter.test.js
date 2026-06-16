const chai = require('chai');

const { OpenMeteoWeatherAdapter, WeatherProvider } = require('../adapters/weatherAdapter');

const { expect } = chai;

// Minimal stand-in for a fetch Response.
const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
    ok,
    status,
    json: async () => body,
});

// Fake fetch that returns queued responses in call order and records the URLs.
const makeFetch = (responses) => {
    const queue = [...responses];
    const fetchFn = async (url) => {
        fetchFn.calls.push(url);
        if (queue.length === 0) throw new Error(`unexpected fetch call: ${url}`);
        return queue.shift();
    };
    fetchFn.calls = [];
    return fetchFn;
};

const GEOCODE_BODY = {
    results: [{ name: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.768 }],
};

const FORECAST_BODY = {
    daily: {
        time: ['2026-07-01', '2026-07-02'],
        weathercode: [0, 61],
        temperature_2m_max: [31.4, 28.0],
        temperature_2m_min: [22.1, 21.5],
        precipitation_sum: [0, 12.3],
    },
};

describe('OpenMeteoWeatherAdapter (Adapter pattern)', () => {
    it('geocodes the destination then returns a normalised forecast DTO', async () => {
        const fetchFn = makeFetch([jsonResponse(GEOCODE_BODY), jsonResponse(FORECAST_BODY)]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        const forecast = await adapter.getForecast({
            location: 'Kyoto, Japan',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
        });

        expect(forecast.location).to.equal('Kyoto, Japan');
        expect(forecast.daily).to.be.an('array').with.lengthOf(2);
        expect(forecast.daily[0]).to.deep.equal({
            date: '2026-07-01',
            tempMinC: 22.1,
            tempMaxC: 31.4,
            precipitationMm: 0,
            summary: 'Clear sky',
        });
        expect(forecast.daily[1].summary).to.equal('Light rain');
    });

    it('geocodes only the leading segment of the destination and forwards the trip date range', async () => {
        const fetchFn = makeFetch([jsonResponse(GEOCODE_BODY), jsonResponse(FORECAST_BODY)]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        await adapter.getForecast({
            location: 'Kyoto, Japan',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
        });

        expect(fetchFn.calls[0]).to.include('name=Kyoto');
        expect(fetchFn.calls[0]).to.not.include('Japan');
        expect(fetchFn.calls[1]).to.include('latitude=35.0116');
        expect(fetchFn.calls[1]).to.include('start_date=2026-07-01');
        expect(fetchFn.calls[1]).to.include('end_date=2026-07-02');
    });

    it('uses the country segment to pick the right candidate when a place name is ambiguous', async () => {
        // Open-Meteo orders candidates by population, so Bali, India comes first.
        const ambiguousGeocode = {
            results: [
                { name: 'Bali', admin1: 'Madhya Pradesh', country: 'India', country_code: 'IN', latitude: 21.7, longitude: 76.3 },
                { name: 'Bali', admin1: 'Bali', country: 'Indonesia', country_code: 'ID', latitude: -8.4, longitude: 115.2 },
            ],
        };
        const fetchFn = makeFetch([jsonResponse(ambiguousGeocode), jsonResponse(FORECAST_BODY)]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        const forecast = await adapter.getForecast({ location: 'Bali, Indonesia' });

        // The country must NOT pollute the geocoding name query...
        expect(fetchFn.calls[0]).to.include('name=Bali');
        expect(fetchFn.calls[0]).to.not.include('Indonesia');
        // ...but it must steer the forecast call to the Indonesian island.
        expect(fetchFn.calls[1]).to.include('latitude=-8.4');
        expect(fetchFn.calls[1]).to.include('longitude=115.2');
        expect(forecast.location).to.equal('Bali, Bali, Indonesia');
    });

    it('falls back to the most populous candidate when no country is given', async () => {
        const ambiguousGeocode = {
            results: [
                { name: 'Bali', country: 'India', country_code: 'IN', latitude: 21.7, longitude: 76.3 },
                { name: 'Bali', country: 'Indonesia', country_code: 'ID', latitude: -8.4, longitude: 115.2 },
            ],
        };
        const fetchFn = makeFetch([jsonResponse(ambiguousGeocode), jsonResponse(FORECAST_BODY)]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        await adapter.getForecast({ location: 'Bali' });

        expect(fetchFn.calls[1]).to.include('latitude=21.7');
    });

    it('maps unmapped weather codes to "Unknown" and preserves a zero precipitation value', async () => {
        const fetchFn = makeFetch([
            jsonResponse(GEOCODE_BODY),
            jsonResponse({
                daily: {
                    time: ['2026-07-01'],
                    weathercode: [123],
                    temperature_2m_max: [20],
                    temperature_2m_min: [10],
                    precipitation_sum: [0],
                },
            }),
        ]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        const forecast = await adapter.getForecast({ location: 'Nowhere' });

        expect(forecast.daily[0].summary).to.equal('Unknown');
        expect(forecast.daily[0].precipitationMm).to.equal(0);
    });

    it('returns an empty daily array when the vendor omits daily data', async () => {
        const fetchFn = makeFetch([jsonResponse(GEOCODE_BODY), jsonResponse({})]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        const forecast = await adapter.getForecast({ location: 'Kyoto' });

        expect(forecast.daily).to.deep.equal([]);
    });

    it('throws without calling the network when the destination is blank', async () => {
        const fetchFn = makeFetch([]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        let error;
        try {
            await adapter.getForecast({ location: '   ' });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an('error');
        expect(error.message).to.match(/destination is required/i);
        expect(fetchFn.calls).to.have.lengthOf(0);
    });

    it('throws when geocoding finds no matching location', async () => {
        const fetchFn = makeFetch([jsonResponse({ results: [] })]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        let error;
        try {
            await adapter.getForecast({ location: 'Atlantis' });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an('error');
        expect(error.message).to.match(/could not find a location/i);
    });

    it('returns an empty forecast when the trip dates are outside Open-Meteo\'s allowed range', async () => {
        const fetchFn = makeFetch([
            jsonResponse(GEOCODE_BODY),
            jsonResponse(
                { error: true, reason: "Parameter 'start_date' is out of allowed range from 2026-03-09 to 2026-06-25" },
                { ok: false, status: 400 },
            ),
        ]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        const forecast = await adapter.getForecast({
            location: 'Kyoto, Japan',
            startDate: '2026-12-01',
            endDate: '2026-12-04',
        });

        expect(forecast.location).to.equal('Kyoto, Japan');
        expect(forecast.daily).to.deep.equal([]);
    });

    it('surfaces the vendor reason when the forecast request fails for another reason', async () => {
        const fetchFn = makeFetch([
            jsonResponse(GEOCODE_BODY),
            jsonResponse(
                { error: true, reason: 'Service temporarily unavailable' },
                { ok: false, status: 503 },
            ),
        ]);
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn });

        let error;
        try {
            await adapter.getForecast({ location: 'Kyoto' });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an('error');
        expect(error.message).to.equal('Service temporarily unavailable');
    });

    it('aborts and reports a timeout when the vendor does not respond in time', async () => {
        // A fetch that never settles on its own; it only rejects once aborted.
        const hangingFetch = (url, options) =>
            new Promise((_, reject) => {
                if (options && options.signal) {
                    options.signal.addEventListener('abort', () => {
                        const abortError = new Error('The operation was aborted');
                        abortError.name = 'AbortError';
                        reject(abortError);
                    });
                }
            });
        const adapter = new OpenMeteoWeatherAdapter({ fetchFn: hangingFetch, timeoutMs: 20 });

        let error;
        try {
            await adapter.getForecast({ location: 'Kyoto' });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an('error');
        expect(error.message).to.match(/timed out/i);
    });

    it('the WeatherProvider target interface refuses to be used directly', async () => {
        let error;
        try {
            await new WeatherProvider().getForecast({ location: 'Kyoto' });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an('error');
        expect(error.message).to.match(/must be implemented by a subclass/i);
    });
});
