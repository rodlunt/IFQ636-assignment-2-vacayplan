const Trip = require('../models/Trip');
const { OpenMeteoWeatherAdapter } = require('../adapters/weatherAdapter');

// The controller depends only on the WeatherProvider contract. The concrete
// Open-Meteo adapter is constructed once here and can be swapped for another
// vendor's adapter without changing the request handler below.
const weatherProvider = new OpenMeteoWeatherAdapter();

const getTripWeather = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const request = {
            location: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
        };

        // The user can search a different place from the weather card (`q`),
        // overriding the trip's stored destination.
        const { q } = req.query;
        if (typeof q === 'string' && q.trim()) {
            request.location = q.trim();
        }

        const forecast = await weatherProvider.getForecast(request);
        res.json(forecast);
    } catch (error) {
        // The trip is valid but the upstream weather vendor failed or returned
        // an unusable response: report it as a gateway error, not a 500.
        res.status(502).json({ message: error.message });
    }
};

module.exports = { getTripWeather };
