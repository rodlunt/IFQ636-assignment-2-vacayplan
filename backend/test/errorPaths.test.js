const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const tripService = require('../services/tripService');
const userService = require('../services/userService');
const { adminProtect } = require('../middleware/adminMiddleware');
const { OpenMeteoWeatherAdapter } = require('../adapters/weatherAdapter');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// protect() sets req.user via User.findById(decoded.id).select('-password').
// For non-admin routes this is the only User.findById call in the chain.
const stubProtect = (id) =>
    sinon.stub(User, 'findById').callsFake(() => ({
        select: sinon.stub().resolves({ _id: id.toString(), name: 'U', email: 'u@test.com' }),
    }));

// protect resolves an admin so adminProtect passes; returns the stub so a
// test can configure the handler's own second User.findById call.
const stubAdminProtect = () => {
    const fb = sinon.stub(User, 'findById');
    fb.onFirstCall().callsFake(() => ({
        select: sinon.stub().resolves({ _id: 'admin1', isAdmin: true }),
    }));
    return fb;
};

const ownedTrip = (userId) => ({
    _id: 'trip1',
    userId: { toString: () => userId.toString() },
    status: 'planning',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-10'),
});

describe('Error and edge-path coverage', () => {
    let userId;
    let token;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId();
        token = tokenFor(userId.toString());
    });

    afterEach(() => sinon.restore());

    describe('tripController 500 / error paths', () => {
        beforeEach(() => stubProtect(userId));

        it('createTrip returns 500 when Trip.create throws a non-validation error', async () => {
            sinon.stub(Trip, 'create').rejects(new Error('db exploded'));
            const res = await chai.request(app).post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send({ destination: 'X', startDate: '2026-07-01', endDate: '2026-07-10' });
            expect(res).to.have.status(500);
            expect(res.body).to.have.property('message', 'db exploded');
        });

        it('getTrips returns 500 when Trip.find throws', async () => {
            sinon.stub(Trip, 'find').throws(new Error('find failed'));
            const res = await chai.request(app).get('/api/trips')
                .set('Authorization', `Bearer ${token}`);
            expect(res).to.have.status(500);
        });

        it('updateTrip returns 400 when save throws a ValidationError', async () => {
            const verr = new Error('bad'); verr.name = 'ValidationError';
            const trip = { ...ownedTrip(userId), save: sinon.stub().rejects(verr) };
            sinon.stub(Trip, 'findById').resolves(trip);
            const res = await chai.request(app).put('/api/trips/trip1')
                .set('Authorization', `Bearer ${token}`)
                .send({ notes: 'x' });
            expect(res).to.have.status(400);
        });

        it('updateTrip returns 500 when save throws a non-validation error', async () => {
            const trip = { ...ownedTrip(userId), save: sinon.stub().rejects(new Error('save boom')) };
            sinon.stub(Trip, 'findById').resolves(trip);
            const res = await chai.request(app).put('/api/trips/trip1')
                .set('Authorization', `Bearer ${token}`)
                .send({ notes: 'x' });
            expect(res).to.have.status(500);
        });

        it('deleteTrip returns 500 when the cascade service throws', async () => {
            sinon.stub(Trip, 'findById').resolves(ownedTrip(userId));
            sinon.stub(tripService, 'deleteTripWithActivities').rejects(new Error('cascade boom'));
            const res = await chai.request(app).delete('/api/trips/trip1')
                .set('Authorization', `Bearer ${token}`);
            expect(res).to.have.status(500);
        });
    });

    describe('activityController 500 / edge paths', () => {
        beforeEach(() => {
            stubProtect(userId);
            sinon.stub(Trip, 'findById').resolves(ownedTrip(userId));
        });

        const activity = (over = {}) => ({
            _id: 'act1',
            tripId: { toString: () => 'trip1' },
            save: sinon.stub().resolvesThis(),
            deleteOne: sinon.stub().resolves(),
            ...over,
        });

        it('addActivity returns 500 when Activity.create throws', async () => {
            sinon.stub(Activity, 'create').rejects(new Error('create boom'));
            const res = await chai.request(app).post('/api/trips/trip1/activities')
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', location: 'Opera House' });
            expect(res).to.have.status(500);
        });

        it('listActivitiesForTrip returns 500 when Activity.find throws', async () => {
            sinon.stub(Activity, 'find').throws(new Error('find boom'));
            const res = await chai.request(app).get('/api/trips/trip1/activities')
                .set('Authorization', `Bearer ${token}`);
            expect(res).to.have.status(500);
        });

        it('updateActivity sets in-range date and other fields and returns 200', async () => {
            sinon.stub(Activity, 'findById').resolves(activity());
            const res = await chai.request(app).put('/api/trips/trip1/activities/act1')
                .set('Authorization', `Bearer ${token}`)
                .send({ date: '2026-07-05', time: '10:00', location: 'Opera House', description: 'Tour' });
            expect(res).to.have.status(200);
        });

        it('updateActivity returns 500 when save throws', async () => {
            sinon.stub(Activity, 'findById').resolves(activity({ save: sinon.stub().rejects(new Error('save boom')) }));
            const res = await chai.request(app).put('/api/trips/trip1/activities/act1')
                .set('Authorization', `Bearer ${token}`)
                .send({ time: '10:00' });
            expect(res).to.have.status(500);
        });

        it('deleteActivity returns 500 when deleteOne throws', async () => {
            sinon.stub(Activity, 'findById').resolves(activity({ deleteOne: sinon.stub().rejects(new Error('del boom')) }));
            const res = await chai.request(app).delete('/api/trips/trip1/activities/act1')
                .set('Authorization', `Bearer ${token}`);
            expect(res).to.have.status(500);
        });

        it('updateActivityStatus returns 500 when save throws', async () => {
            sinon.stub(Activity, 'findById').resolves(activity({ save: sinon.stub().rejects(new Error('save boom')) }));
            const res = await chai.request(app).patch('/api/trips/trip1/activities/act1/status')
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'booked' });
            expect(res).to.have.status(500);
        });
    });

    describe('adminController 500 paths', () => {
        it('createUser returns 500 when User.create throws', async () => {
            stubAdminProtect();
            sinon.stub(User, 'findOne').resolves(null);
            sinon.stub(User, 'create').rejects(new Error('create boom'));
            const res = await chai.request(app).post('/api/admin/users')
                .set('Authorization', `Bearer ${tokenFor('admin1')}`)
                .send({ name: 'N', email: 'n@test.com', password: 'secret123' });
            expect(res).to.have.status(500);
        });

        it('getUserDetail returns 500 when the lookup throws', async () => {
            const fb = stubAdminProtect();
            fb.onSecondCall().callsFake(() => ({ select: sinon.stub().rejects(new Error('lookup boom')) }));
            const res = await chai.request(app).get('/api/admin/users/u2')
                .set('Authorization', `Bearer ${tokenFor('admin1')}`);
            expect(res).to.have.status(500);
        });

        it('updateUserStatus returns 500 when save throws', async () => {
            const fb = stubAdminProtect();
            fb.onSecondCall().resolves({ _id: 'u2', status: 'deactivated', save: sinon.stub().rejects(new Error('save boom')) });
            const res = await chai.request(app).patch('/api/admin/users/u2')
                .set('Authorization', `Bearer ${tokenFor('admin1')}`)
                .send({ status: 'active' });
            expect(res).to.have.status(500);
        });

        it('deleteUser returns 500 when the cascade service throws', async () => {
            const fb = stubAdminProtect();
            fb.onSecondCall().resolves({ _id: 'u2' });
            sinon.stub(userService, 'deleteUserWithCascade').rejects(new Error('cascade boom'));
            const res = await chai.request(app).delete('/api/admin/users/u2')
                .set('Authorization', `Bearer ${tokenFor('admin1')}`);
            expect(res).to.have.status(500);
        });
    });

    describe('middleware edge branches', () => {
        it('adminProtect returns 401 when there is no authenticated user', () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
            const next = sinon.stub();

            adminProtect(req, res, next);

            expect(res.status.calledWith(401)).to.equal(true);
            expect(next.called).to.equal(false);
        });

        it('protect returns 401 when the bearer token is malformed', async () => {
            const res = await chai.request(app).get('/api/trips')
                .set('Authorization', 'Bearer not-a-real-jwt');
            expect(res).to.have.status(401);
            expect(res.body).to.have.property('message', 'Not authorized, token failed');
        });

        it('withOwnership returns 500 when the trip lookup throws', async () => {
            stubProtect(userId);
            sinon.stub(Trip, 'findById').throws(new Error('lookup boom'));
            const res = await chai.request(app).get('/api/trips/trip1')
                .set('Authorization', `Bearer ${token}`);
            expect(res).to.have.status(500);
        });
    });

    describe('weatherAdapter error-body handling', () => {
        it('keeps the status-based message when the error response body is not JSON', async () => {
            const badResponse = {
                ok: false,
                status: 502,
                json: async () => { throw new Error('not json'); },
            };
            const adapter = new OpenMeteoWeatherAdapter({ fetchFn: async () => badResponse });

            let err;
            try {
                await adapter.getForecast({ location: 'Kyoto, Japan', startDate: '2026-07-01', endDate: '2026-07-02' });
            } catch (e) {
                err = e;
            }

            expect(err).to.exist;
            expect(err.message).to.match(/request failed \(502\)/);
        });
    });
});
