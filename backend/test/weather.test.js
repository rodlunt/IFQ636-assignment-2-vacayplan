const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Trip = require('../models/Trip');
const User = require('../models/User');
const { OpenMeteoWeatherAdapter } = require('../adapters/weatherAdapter');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

const SAMPLE_FORECAST = {
    location: 'Kyoto, Japan',
    daily: [
        { date: '2026-07-01', tempMinC: 22.1, tempMaxC: 31.4, precipitationMm: 0, summary: 'Clear sky' },
        { date: '2026-07-02', tempMinC: 21.5, tempMaxC: 28.0, precipitationMm: 12.3, summary: 'Light rain' },
    ],
};

describe('Weather Controller (/api/trips/:id/weather)', () => {
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

    it('VP-57: returns 200 with the forecast for the trip the user owns', async () => {
        const tripId = new mongoose.Types.ObjectId();
        const trip = {
            _id: tripId,
            destination: 'Kyoto, Japan',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
            userId,
        };
        sinon.stub(Trip, 'findById').resolves(trip);
        const getForecast = sinon
            .stub(OpenMeteoWeatherAdapter.prototype, 'getForecast')
            .resolves(SAMPLE_FORECAST);

        const res = await chai.request(app)
            .get(`/api/trips/${tripId}/weather`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('location', 'Kyoto, Japan');
        expect(res.body.daily).to.be.an('array').with.lengthOf(2);
        expect(getForecast.calledOnce).to.be.true;
        expect(getForecast.firstCall.args[0]).to.deep.equal({
            location: 'Kyoto, Japan',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
        });
    });

    it('uses the q query param to search a different place than the trip destination', async () => {
        const tripId = new mongoose.Types.ObjectId();
        const trip = {
            _id: tripId,
            destination: 'Bali, India',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
            userId,
        };
        sinon.stub(Trip, 'findById').resolves(trip);
        const getForecast = sinon
            .stub(OpenMeteoWeatherAdapter.prototype, 'getForecast')
            .resolves(SAMPLE_FORECAST);

        const res = await chai.request(app)
            .get(`/api/trips/${tripId}/weather`)
            .query({ q: 'Ubud, Indonesia' })
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(200);
        expect(getForecast.firstCall.args[0].location).to.equal('Ubud, Indonesia');
    });

    it('returns 404 and does not call the weather provider when the trip does not exist', async () => {
        sinon.stub(Trip, 'findById').resolves(null);
        const getForecast = sinon.stub(OpenMeteoWeatherAdapter.prototype, 'getForecast');

        const res = await chai.request(app)
            .get(`/api/trips/${new mongoose.Types.ObjectId()}/weather`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(404);
        expect(getForecast.notCalled).to.be.true;
    });

    it('returns 404 and does not call the weather provider for another user\'s trip (no resource-enumeration leak)', async () => {
        const tripId = new mongoose.Types.ObjectId();
        const trip = { _id: tripId, destination: 'Kyoto, Japan', userId: otherUserId };
        sinon.stub(Trip, 'findById').resolves(trip);
        const getForecast = sinon.stub(OpenMeteoWeatherAdapter.prototype, 'getForecast');

        const res = await chai.request(app)
            .get(`/api/trips/${tripId}/weather`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message', 'Trip not found');
        expect(getForecast.notCalled).to.be.true;
    });

    it('returns 401 when no auth token is provided', async () => {
        const res = await chai.request(app)
            .get(`/api/trips/${new mongoose.Types.ObjectId()}/weather`);

        expect(res).to.have.status(401);
    });

    it('VP-57: returns 502 when the upstream weather provider fails', async () => {
        const tripId = new mongoose.Types.ObjectId();
        const trip = { _id: tripId, destination: 'Kyoto, Japan', userId };
        sinon.stub(Trip, 'findById').resolves(trip);
        sinon
            .stub(OpenMeteoWeatherAdapter.prototype, 'getForecast')
            .rejects(new Error('Weather request failed (503)'));

        const res = await chai.request(app)
            .get(`/api/trips/${tripId}/weather`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(502);
        expect(res.body).to.have.property('message', 'Weather request failed (503)');
    });
});
