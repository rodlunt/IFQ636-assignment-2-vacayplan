const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const tripService = require('../services/tripService');
const userService = require('../services/userService');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const User = require('../models/User');

describe('Facade services', () => {

  describe('TripService', () => {
    it('deletes all activities for a trip then deletes the trip', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const trip = { _id: tripId, deleteOne: sinon.stub().resolves() };
      sinon.stub(Activity, 'deleteMany').resolves();

      await tripService.deleteTripWithActivities(trip);

      expect(Activity.deleteMany.calledOnceWith({ tripId })).to.be.true;
      expect(trip.deleteOne.calledOnce).to.be.true;

      sinon.restore();
    });

    it('deletes activities before the trip document', async () => {
      const callOrder = [];
      const trip = { _id: new mongoose.Types.ObjectId(), deleteOne: sinon.stub().callsFake(() => { callOrder.push('trip'); return Promise.resolve(); }) };
      sinon.stub(Activity, 'deleteMany').callsFake(() => { callOrder.push('activities'); return Promise.resolve(); });

      await tripService.deleteTripWithActivities(trip);

      expect(callOrder).to.deep.equal(['activities', 'trip']);
      sinon.restore();
    });
  });

  describe('UserService', () => {
    it('deletes activities, trips, then the user in order', async () => {
      const callOrder = [];
      const userId = new mongoose.Types.ObjectId();
      const user = { _id: userId, email: 'user@test.com', deleteOne: sinon.stub().callsFake(() => { callOrder.push('user'); return Promise.resolve(); }) };
      const adminUser = { _id: new mongoose.Types.ObjectId(), email: 'admin@test.com' };
      const tripId = new mongoose.Types.ObjectId();

      sinon.stub(Trip, 'find').returns({ select: sinon.stub().resolves([{ _id: tripId }]) });
      sinon.stub(Activity, 'deleteMany').callsFake(() => { callOrder.push('activities'); return Promise.resolve(); });
      sinon.stub(Trip, 'deleteMany').callsFake(() => { callOrder.push('trips'); return Promise.resolve(); });

      await userService.deleteUserWithCascade(user, adminUser);

      expect(callOrder).to.deep.equal(['activities', 'trips', 'user']);
      sinon.restore();
    });

    it('writes an audit log entry on successful delete', async () => {
      const userId = new mongoose.Types.ObjectId();
      const user = { _id: userId, email: 'user@test.com', deleteOne: sinon.stub().resolves() };
      const adminUser = { _id: new mongoose.Types.ObjectId(), email: 'admin@test.com' };

      sinon.stub(Trip, 'find').returns({ select: sinon.stub().resolves([]) });
      sinon.stub(Activity, 'deleteMany').resolves();
      sinon.stub(Trip, 'deleteMany').resolves();
      const consoleSpy = sinon.spy(console, 'log');

      await userService.deleteUserWithCascade(user, adminUser);

      expect(consoleSpy.calledOnce).to.be.true;
      expect(consoleSpy.firstCall.args[0]).to.include('[AUDIT]');
      expect(consoleSpy.firstCall.args[0]).to.include(user.email);
      expect(consoleSpy.firstCall.args[0]).to.include(adminUser.email);
      sinon.restore();
    });
  });

});
