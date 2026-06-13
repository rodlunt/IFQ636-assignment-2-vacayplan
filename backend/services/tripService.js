// services/tripService.js
// DESIGN PATTERN - FACADE - Hides the multi-model cascade complexity of trip
// deletion behind a single service interface. tripController.deleteTrip calls
// one method instead of coordinating Trip and Activity models directly,
// keeping HTTP flow logic separate from data management logic.

const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

class TripService {
  // FR-11: The system shall remove all activities associated with a trip
  // when that trip is permanently deleted.
  async deleteTripWithActivities(trip) {
    await Activity.deleteMany({ tripId: trip._id });
    await trip.deleteOne();
  }
}

module.exports = new TripService();
