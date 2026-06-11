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

describe('Trip Controller (/api/trips)', () => {
    let userId;
    let otherUserId;
    let token;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId();
        otherUserId = new mongoose.Types.ObjectId();
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

    describe('POST /api/trips', () => {
        it('creates a trip with valid body and returns 201', async () => {
            const tripData = {
                destination: 'Sydney',
                startDate: '2026-07-01',
                endDate: '2026-07-10',
                budget: 2000,
            };
            const createdTrip = { _id: new mongoose.Types.ObjectId(), ...tripData, userId };
            sinon.stub(Trip, 'create').resolves(createdTrip);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send(tripData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('destination', 'Sydney');
            expect(Trip.create.calledOnce).to.be.true;
        });

        it('returns 401 when no auth token is provided', async () => {
            const res = await chai.request(app)
                .post('/api/trips')
                .send({ destination: 'Sydney' });

            expect(res).to.have.status(401);
        });

        it('returns 400 when Trip.create throws a Mongoose ValidationError (endDate before startDate)', async () => {
            const validationError = new Error('End date must be on or after start date');
            validationError.name = 'ValidationError';
            sinon.stub(Trip, 'create').rejects(validationError);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send({ destination: 'Sydney', startDate: '2026-07-10', endDate: '2026-07-01' });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message');
        });

        it('VP-105: creates a trip with status set and returns 201', async () => {
            const tripData = {
                destination: 'Bali',
                startDate: '2026-06-12',
                endDate: '2026-06-19',
                status: 'active',
            };
            const createdTrip = { _id: new mongoose.Types.ObjectId(), ...tripData, userId };
            sinon.stub(Trip, 'create').resolves(createdTrip);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send(tripData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('status', 'active');
            expect(Trip.create.firstCall.args[0]).to.include({ status: 'active' });
        });

        it('VP-105: creates a trip with coverPhoto set and returns 201', async () => {
            const tripData = {
                destination: 'Tokyo',
                startDate: '2026-09-03',
                endDate: '2026-09-10',
                coverPhoto: '/assets/trips/tokyo.webp',
            };
            const createdTrip = { _id: new mongoose.Types.ObjectId(), ...tripData, userId };
            sinon.stub(Trip, 'create').resolves(createdTrip);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send(tripData);

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('coverPhoto', '/assets/trips/tokyo.webp');
            expect(Trip.create.firstCall.args[0]).to.include({ coverPhoto: '/assets/trips/tokyo.webp' });
        });

        it('VP-105: omitting status + coverPhoto passes undefined through to schema (defaults applied at model layer)', async () => {
            const tripData = {
                destination: 'Sydney',
                startDate: '2026-07-01',
                endDate: '2026-07-10',
            };
            const createdTrip = { _id: new mongoose.Types.ObjectId(), ...tripData, status: 'planning', coverPhoto: null, userId };
            sinon.stub(Trip, 'create').resolves(createdTrip);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send(tripData);

            expect(res).to.have.status(201);
            const callArgs = Trip.create.firstCall.args[0];
            expect(callArgs).to.have.property('status', undefined);
            expect(callArgs).to.have.property('coverPhoto', undefined);
        });

        it('VP-105: invalid status enum value rejected with 400', async () => {
            const validationError = new Error('`bogus` is not a valid enum value for path `status`.');
            validationError.name = 'ValidationError';
            sinon.stub(Trip, 'create').rejects(validationError);

            const res = await chai.request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send({ destination: 'Sydney', startDate: '2026-07-01', endDate: '2026-07-10', status: 'bogus' });

            expect(res).to.have.status(400);
            expect(res.body.message).to.match(/status/i);
        });
    });

    describe('GET /api/trips', () => {
        it('returns the authenticated user\'s trips ordered newest first', async () => {
            const trips = [
                { _id: new mongoose.Types.ObjectId(), destination: 'Sydney', userId },
                { _id: new mongoose.Types.ObjectId(), destination: 'Melbourne', userId },
            ];
            sinon.stub(Trip, 'find').returns({ sort: sinon.stub().resolves(trips) });

            const res = await chai.request(app)
                .get('/api/trips')
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
            expect(Trip.find.calledWith({ userId: userId.toString() })).to.be.true;
        });
    });

    describe('GET /api/trips/:id', () => {
        it('returns the trip when it belongs to the authenticated user', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = { _id: tripId, destination: 'Sydney', userId };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('destination', 'Sydney');
        });

        it('returns 404 when the trip does not exist', async () => {
            sinon.stub(Trip, 'findById').resolves(null);

            const res = await chai.request(app)
                .get(`/api/trips/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
        });

        it('returns 404 when the trip belongs to another user (no resource-enumeration leak)', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = { _id: tripId, destination: 'Sydney', userId: otherUserId };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .get(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
        });
    });

    describe('PUT /api/trips/:id', () => {
        it('updates the trip when owned by the authenticated user', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = {
                _id: tripId,
                destination: 'Sydney',
                userId,
                save: sinon.stub().resolvesThis(),
            };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ destination: 'Melbourne' });

            expect(res).to.have.status(200);
            expect(trip.save.calledOnce).to.be.true;
        });

        it('uses partial update semantics without overwriting omitted fields', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = {
                _id: tripId,
                destination: 'Sydney',
                budget: 1500,
                notes: 'Original note',
                userId,
                save: sinon.stub().resolvesThis(),
            };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ budget: 0 });

            expect(res).to.have.status(200);
            expect(trip.destination).to.equal('Sydney');
            expect(trip.budget).to.equal(0);
            expect(trip.notes).to.equal('Original note');
            expect(trip.save.calledOnce).to.be.true;
        });

        it('VP-105: updating status changes the status field on the saved doc', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = {
                _id: tripId,
                destination: 'Bali',
                status: 'planning',
                userId,
                save: sinon.stub().resolvesThis(),
            };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'active' });

            expect(res).to.have.status(200);
            expect(trip.status).to.equal('active');
            expect(trip.save.calledOnce).to.be.true;
        });

        it('returns 404 and does not save when trying to update another user\'s trip (no resource-enumeration leak)', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = { _id: tripId, userId: otherUserId, save: sinon.stub() };
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .put(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ destination: 'Melbourne' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(trip.save.notCalled).to.be.true;
        });
    });

    describe('DELETE /api/trips/:id', () => {
        it('deletes the trip when owned by the authenticated user and returns 204 No Content', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = {
                _id: tripId,
                userId,
                deleteOne: sinon.stub().resolves(),
            };
            sinon.stub(Trip, 'findById').resolves(trip);
            sinon.stub(Activity, 'deleteMany').resolves({ deletedCount: 0 });

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(204);
            expect(res.body).to.deep.equal({});
            expect(trip.deleteOne.calledOnce).to.be.true;
        });

        it('cascade-deletes all activities belonging to the trip before deleting the trip itself (VP-49)', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = {
                _id: tripId,
                userId,
                deleteOne: sinon.stub().resolves(),
            };
            const deleteManyStub = sinon.stub(Activity, 'deleteMany').resolves({ deletedCount: 3 });
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(204);
            expect(deleteManyStub.calledOnce).to.be.true;
            expect(deleteManyStub.firstCall.args[0]).to.deep.equal({ tripId: trip._id });
            expect(deleteManyStub.calledBefore(trip.deleteOne)).to.be.true;
            expect(trip.deleteOne.calledOnce).to.be.true;
        });

        it('returns 404 and does not delete when trying to delete another user\'s trip (no resource-enumeration leak)', async () => {
            const tripId = new mongoose.Types.ObjectId();
            const trip = { _id: tripId, userId: otherUserId, deleteOne: sinon.stub() };
            const deleteManyStub = sinon.stub(Activity, 'deleteMany');
            sinon.stub(Trip, 'findById').resolves(trip);

            const res = await chai.request(app)
                .delete(`/api/trips/${tripId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Trip not found');
            expect(trip.deleteOne.notCalled).to.be.true;
            expect(deleteManyStub.notCalled).to.be.true;
        });
    });
});
