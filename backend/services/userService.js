// services/userService.js
// DESIGN PATTERN - FACADE - Hides the multi-model cascade complexity of user
// deletion behind a single service interface. adminController.deleteUser calls
// one method instead of coordinating User, Trip, and Activity models directly,
// keeping HTTP flow logic separate from data management logic.

const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

class UserService {
  // FR-19: The system shall remove all trips and activities associated with
  // a user account when that account is permanently deleted.
  async deleteUserWithCascade(user, adminUser) {
    const trips = await Trip.find({ userId: user._id }).select('_id');
    const tripIds = trips.map((t) => t._id);
    await Activity.deleteMany({ tripId: { $in: tripIds } });
    await Trip.deleteMany({ userId: user._id });
    await user.deleteOne();
    console.log(`[AUDIT] User ${user.email} (id ${user._id}) deleted by admin ${adminUser.email} (id ${adminUser._id}) at ${new Date().toISOString()}`);
  }
}

module.exports = new UserService();
