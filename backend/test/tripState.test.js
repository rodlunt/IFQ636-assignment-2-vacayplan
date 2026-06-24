const { expect } = require('chai');
const {
    TripState,
    isValidTransition,
} = require('../state/tripState');

// Unit-level coverage for the State pattern. The API-level transition
// behaviour is exercised in trip.test.js; these tests target the base-class
// guard and the lookup function directly.
describe('TripState (State pattern, state/tripState.js)', () => {
    it('the base TripState refuses to be used directly', () => {
        expect(() => new TripState().canTransitionTo('active'))
            .to.throw(/must be implemented by a subclass/);
    });

    it('isValidTransition returns false for an unknown current status', () => {
        expect(isValidTransition('archived', 'active')).to.equal(false);
    });

    it('enforces the planning -> active -> completed lifecycle', () => {
        expect(isValidTransition('planning', 'active')).to.equal(true);
        expect(isValidTransition('planning', 'completed')).to.equal(false);
        expect(isValidTransition('active', 'completed')).to.equal(true);
        expect(isValidTransition('active', 'planning')).to.equal(false);
        expect(isValidTransition('completed', 'planning')).to.equal(false);
    });
});
