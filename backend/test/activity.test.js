const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const User = require('../models/User');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

describe('Activity Controller (/api/trips/:tripId/activities)', () => {
    let userId;
    let otherUserId;
    let token;
    let tripId;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId();
        otherUserId = new mongoose.Types.ObjectId();
        tripId = new mongoose.Types.ObjectId();
        token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

        sinon.stub(User, 'findById').callsFake(() => ({
            select: sinon.stub().resolves({
                _id: userId.toString(),
                name: 'Test User',
                email: 'test@test.com',
            }),
        }));
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/trips/:tripId/activities', () => {
        it('creates an activity for an owned trip and returns 201', async () => {
            const trip = {
                _id: tripId,
                userId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            const activityData = {
                date: '2026-07-05',
                time: '10:00',
                location: 'Sydney Opera House',
                description: 'Guided tour',
                status: 'booked',
            };
            const createdActivity = {
                _id: new mongoose.Types.ObjectId(),
                tripId,
                ...activityData,
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            sinon.stub(Activity, 'create').resolves(createdActivity);

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send(activityData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('location', 'Sydney Opera House');
            expect(Activity.create.calledOnce).to.be.true;
            const createArg = Activity.create.firstCall.args[0];
            expect(createArg.tripId.toString()).to.equal(tripId.toString());
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .send({ date: '2026-07-05', time: '10:00', location: 'X' });

            expect(res).to.have.status(401);
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', time: '10:00', location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            const trip = {
                _id: tripId,
                userId: otherUserId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            const createSpy = sinon.stub(Activity, 'create');

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', time: '10:00', location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 400 when activity date falls outside the trip date range', async () => {
            const trip = {
                _id: tripId,
                userId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            const createSpy = sinon.stub(Activity, 'create');

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-08-01', time: '10:00', location: 'X' });

            expect(res).to.have.status(400);
            expect(createSpy.notCalled).to.be.true;
        });

        it('returns 400 when date is missing (date is the only required field per R031)', async () => {
            const trip = {
                _id: tripId,
                userId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            const createSpy = sinon.stub(Activity, 'create');

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ time: '10:00', location: 'X' });

            expect(res).to.have.status(400);
            expect(createSpy.notCalled).to.be.true;
        });

        it('creates an activity with no time (R031 optional time) and returns 201', async () => {
            const trip = {
                _id: tripId,
                userId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            const created = { _id: new mongoose.Types.ObjectId(), tripId, date: new Date('2026-07-05'), location: 'X' };
            sinon.stub(Activity, 'create').resolves(created);

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', location: 'X' });

            expect(res).to.have.status(201);
        });

        it('creates an activity with no location (R031 optional location) and returns 201', async () => {
            const trip = {
                _id: tripId,
                userId,
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-07-10'),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            const created = { _id: new mongoose.Types.ObjectId(), tripId, date: new Date('2026-07-05'), time: '10:00' };
            sinon.stub(Activity, 'create').resolves(created);

            const res = await chai.request(app)
                .post(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', time: '10:00' });

            expect(res).to.have.status(201);
        });
    });

    describe('GET /api/trips/:tripId/activities', () => {
        it('returns activities for an owned trip sorted by date then time', async () => {
            const trip = { _id: tripId, userId };
            const activities = [
                { _id: new mongoose.Types.ObjectId(), tripId, date: '2026-07-05', time: '09:00', location: 'A' },
                { _id: new mongoose.Types.ObjectId(), tripId, date: '2026-07-05', time: '14:00', location: 'B' },
                { _id: new mongoose.Types.ObjectId(), tripId, date: '2026-07-06', time: '10:00', location: 'C' },
            ];
            sinon.stub(Trip, 'findById').resolves(trip);
            const sortStub = sinon.stub().resolves(activities);
            sinon.stub(Activity, 'find').returns({ sort: sortStub });

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(3);
            expect(Activity.find.calledWith({ tripId: trip._id })).to.be.true;
            expect(sortStub.calledWith({ date: 1, time: 1 })).to.be.true;
        });

        it('returns an empty array when the owned trip has no activities', async () => {
            const trip = { _id: tripId, userId };
            sinon.stub(Trip, 'findById').resolves(trip);
            sinon.stub(Activity, 'find').returns({ sort: sinon.stub().resolves([]) });

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(0);
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .get(`/api/trips/${tripId}/activities`);

            expect(res).to.have.status(401);
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            const trip = { _id: tripId, userId: otherUserId };
            sinon.stub(Trip, 'findById').resolves(trip);
            const findSpy = sinon.stub(Activity, 'find');

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}/activities`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(findSpy.notCalled).to.be.true;
        });
    });

    describe('PUT /api/trips/:tripId/activities/:activityId', () => {
        const ownedTrip = () => ({
            _id: tripId,
            userId,
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-07-10'),
        });

        it('updates the activity when owned by the authenticated user and returns 200', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                date: new Date('2026-07-05'),
                time: '10:00',
                location: 'Old',
                save: sinon.stub().resolvesThis(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'New', status: 'booked' });

            expect(res).to.have.status(200);
            expect(activity.save.calledOnce).to.be.true;
            expect(activity.location).to.equal('New');
            expect(activity.status).to.equal('booked');
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .send({ location: 'X' });

            expect(res).to.have.status(401);
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            sinon.stub(Trip, 'findById').resolves({ _id: tripId, userId: otherUserId });
            const findActivitySpy = sinon.stub(Activity, 'findById');

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(findActivitySpy.notCalled).to.be.true;
        });

        it('returns 404 when the activity does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(null);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
        });

        it('returns 404 when the activity belongs to a different trip in the same user (cross-trip leak guard)', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const otherTripId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId: otherTripId,
                save: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'X' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
            expect(activity.save.notCalled).to.be.true;
        });

        it('returns 400 when the new date falls outside the trip date range', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                date: new Date('2026-07-05'),
                save: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}/activities/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-08-01' });

            expect(res).to.have.status(400);
            expect(activity.save.notCalled).to.be.true;
        });
    });

    describe('DELETE /api/trips/:tripId/activities/:activityId', () => {
        const ownedTrip = () => ({ _id: tripId, userId });

        it('deletes the activity when owned by the authenticated user and returns 204', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                deleteOne: sinon.stub().resolves(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${activityId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(204);
            expect(res.body).to.deep.equal({});
            expect(activity.deleteOne.calledOnce).to.be.true;
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`);

            expect(res).to.have.status(401);
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            sinon.stub(Trip, 'findById').resolves({ _id: tripId, userId: otherUserId });
            const findActivitySpy = sinon.stub(Activity, 'findById');

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(findActivitySpy.notCalled).to.be.true;
        });

        it('returns 404 when the activity does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(null);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
        });

        it('returns 404 when the activity belongs to a different trip (cross-trip leak guard)', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const otherTripId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId: otherTripId,
                deleteOne: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}/activities/${activityId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
            expect(activity.deleteOne.notCalled).to.be.true;
        });
    });

    describe('PATCH /api/trips/:tripId/activities/:activityId/status', () => {
        const ownedTrip = () => ({ _id: tripId, userId });

        it('toggles status from wishlist to booked and returns 200', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                status: 'wishlist',
                save: sinon.stub().resolvesThis(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${activityId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });

            expect(res).to.have.status(200);
            expect(activity.status).to.equal('booked');
            expect(activity.save.calledOnce).to.be.true;
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}/status`)
                .send({ status: 'booked' });

            expect(res).to.have.status(401);
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            sinon.stub(Trip, 'findById').resolves({ _id: tripId, userId: otherUserId });
            const findActivitySpy = sinon.stub(Activity, 'findById');

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(findActivitySpy.notCalled).to.be.true;
        });

        it('returns 404 when the activity does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(null);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${new mongoose.Types.ObjectId()}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
        });

        it('returns 404 when the activity belongs to a different trip (cross-trip leak guard)', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const otherTripId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId: otherTripId,
                save: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${activityId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Activity not found');
            expect(activity.save.notCalled).to.be.true;
        });

        it('returns 400 when status is an invalid enum value', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                status: 'wishlist',
                save: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${activityId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'confirmed' });

            expect(res).to.have.status(400);
            expect(activity.save.notCalled).to.be.true;
        });

        it('returns 400 when status is missing from the body', async () => {
            const activityId = new mongoose.Types.ObjectId();
            const activity = {
                _id: activityId,
                tripId,
                status: 'wishlist',
                save: sinon.stub(),
            };
            sinon.stub(Trip, 'findById').resolves(ownedTrip());
            sinon.stub(Activity, 'findById').resolves(activity);

            const res = await chai.request(app)
                .patch(`/api/trips/${tripId}/activities/${activityId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res).to.have.status(400);
            expect(activity.save.notCalled).to.be.true;
        });
    });
});
