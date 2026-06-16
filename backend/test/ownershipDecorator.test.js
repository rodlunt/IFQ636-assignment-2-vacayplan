const { expect } = require('chai');
const sinon = require('sinon');
const Trip = require('../models/Trip');
const { withOwnership } = require('../middleware/ownershipDecorator');

const makeRes = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    return res;
};

describe('withOwnership (Decorator)', () => {
    let findByIdStub;

    beforeEach(() => {
        findByIdStub = sinon.stub(Trip, 'findById');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('attaches req.trip and calls the wrapped handler when the user owns the trip', async () => {
        const trip = { _id: 'trip1', userId: { toString: () => 'user1' } };
        findByIdStub.resolves(trip);

        const handler = sinon.stub();
        const req = { params: { id: 'trip1' }, user: { _id: { toString: () => 'user1' } } };
        const res = makeRes();

        await withOwnership(handler)(req, res);

        expect(req.trip).to.equal(trip);
        expect(handler.calledOnce).to.equal(true);
        expect(res.status.called).to.equal(false);
    });

    it('returns 404 and does not call the handler when the trip does not exist', async () => {
        findByIdStub.resolves(null);

        const handler = sinon.stub();
        const req = { params: { id: 'nonexistent' }, user: { _id: { toString: () => 'user1' } } };
        const res = makeRes();

        await withOwnership(handler)(req, res);

        expect(handler.called).to.equal(false);
        expect(res.status.calledOnceWith(404)).to.equal(true);
        expect(res.json.calledOnceWith({ message: 'Trip not found' })).to.equal(true);
    });

    it('returns 404 and does not call the handler when the user does not own the trip', async () => {
        const trip = { _id: 'trip1', userId: { toString: () => 'other-user' } };
        findByIdStub.resolves(trip);

        const handler = sinon.stub();
        const req = { params: { id: 'trip1' }, user: { _id: { toString: () => 'user1' } } };
        const res = makeRes();

        await withOwnership(handler)(req, res);

        expect(handler.called).to.equal(false);
        expect(res.status.calledOnceWith(404)).to.equal(true);
        expect(res.json.calledOnceWith({ message: 'Trip not found' })).to.equal(true);
    });

    it('resolves the trip from req.params.tripId for activity routes', async () => {
        const trip = { _id: 'trip1', userId: { toString: () => 'user1' } };
        findByIdStub.resolves(trip);

        const handler = sinon.stub();
        const req = { params: { tripId: 'trip1' }, user: { _id: { toString: () => 'user1' } } };
        const res = makeRes();

        await withOwnership(handler)(req, res);

        expect(req.trip).to.equal(trip);
        expect(handler.calledOnce).to.equal(true);
    });
});
