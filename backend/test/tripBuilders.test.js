const { expect } = require('chai');
const mongoose = require('mongoose');

const { TripQueryBuilder, TripUpdateBuilder } = require('../builders/tripBuilders');

describe('Trip builders', () => {
    describe('TripQueryBuilder', () => {
        it('builds the authenticated user trip query with newest-first sorting', () => {
            const userId = new mongoose.Types.ObjectId();

            const tripQuery = new TripQueryBuilder()
                .forUser(userId)
                .newestFirst()
                .build();

            expect(tripQuery.filter).to.deep.equal({ userId });
            expect(tripQuery.sort).to.deep.equal({ createdAt: -1 });
        });
    });

    describe('TripUpdateBuilder', () => {
        it('applies only supplied update fields and preserves falsey values', () => {
            const trip = {
                destination: 'Sydney',
                budget: 1200,
                notes: 'Keep this note',
                status: 'planning',
                coverPhoto: '/assets/trips/sydney.webp',
            };

            const updatedTrip = new TripUpdateBuilder(trip)
                .withFields({
                    destination: 'Melbourne',
                    budget: 0,
                    notes: null,
                    status: undefined,
                    coverPhoto: '',
                })
                .build();

            expect(updatedTrip.destination).to.equal('Melbourne');
            expect(updatedTrip.budget).to.equal(0);
            expect(updatedTrip.notes).to.equal('Keep this note');
            expect(updatedTrip.status).to.equal('planning');
            expect(updatedTrip.coverPhoto).to.equal('');
        });
    });
});
