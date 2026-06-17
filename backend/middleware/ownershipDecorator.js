// DESIGN PATTERN - DECORATOR - withOwnership wraps a route handler and adds
// ownership verification without modifying the handler itself. The decorator
// fetches the trip, checks the requesting user owns it, and attaches it as
// req.trip before delegating to the wrapped handler - or terminates with 404
// if the trip does not exist or belongs to another user. This eliminates the
// ownership-check block that was duplicated across 8 handlers (3 in
// tripController, 5 in activityController). Routes wire the decoration
// explicitly: withOwnership(handler) in tripRoutes.js and activityRoutes.js.
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
