const { expect } = require('chai');
const Trip = require('../models/Trip');

// Covers the endDate schema validator (models/Trip.js): end date must be on
// or after start date. validateSync runs validators without touching the DB.
describe('Trip model validation (models/Trip.js)', () => {
    it('rejects an end date before the start date', () => {
        const trip = new Trip({
            destination: 'Sydney',
            startDate: new Date('2026-07-10'),
            endDate: new Date('2026-07-01'),
        });

        const err = trip.validateSync();

        expect(err).to.exist;
        expect(err.errors).to.have.property('endDate');
        expect(err.errors.endDate.message).to.match(/on or after start date/);
    });

    it('accepts an end date on or after the start date', () => {
        const trip = new Trip({
            destination: 'Sydney',
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-07-10'),
        });

        const err = trip.validateSync();

        expect(err && err.errors && err.errors.endDate).to.equal(undefined);
    });

    it('passes the endDate order rule when no start date is set', () => {
        const trip = new Trip({
            destination: 'Sydney',
            endDate: new Date('2026-07-10'),
        });

        const err = trip.validateSync();

        // startDate is required so an error exists, but not for the order rule.
        expect(err.errors.endDate).to.equal(undefined);
    });
});
