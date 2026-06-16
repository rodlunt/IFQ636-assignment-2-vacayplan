const Trip = require('../models/Trip');

const withOwnership = (handler) => async (req, res) => {
    try {
        const tripId = req.params.id || req.params.tripId;
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        req.trip = trip;
        return handler(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { withOwnership };
