// backend/state/tripState.js
// DESIGN PATTERN - STATE - Models the trip lifecycle (FR-10: planning ->
// active -> completed) as a set of state classes, each knowing which
// transitions are valid from itself. Replaces what would otherwise be an
// if/else chain checked against trip.status every time a status update
// is requested.

class TripState {
    // Interface guard: concrete states must implement canTransitionTo.
    canTransitionTo(newStatus) {
        throw new Error('TripState.canTransitionTo must be implemented by a subclass');
    }
}

class PlanningState extends TripState {
    // FR-10: planning can only advance to active.
    canTransitionTo(newStatus) {
        return newStatus === 'active';
    }
}

class ActiveState extends TripState {
    // FR-10: active can only advance to completed.
    canTransitionTo(newStatus) {
        return newStatus === 'completed';
    }
}

class CompletedState extends TripState {
    // FR-10: completed is terminal, no further transitions permitted.
    canTransitionTo(newStatus) {
        return false;
    }
}

const STATES = {
    planning: new PlanningState(),
    active: new ActiveState(),
    completed: new CompletedState(),
};

// Single entry point for transition validation: looks up the state object
// for the trip's current status and delegates the check to it.
function isValidTransition(currentStatus, newStatus) {
    const state = STATES[currentStatus];
    if (!state) return false;
    return state.canTransitionTo(newStatus);
}

module.exports = {
    TripState,
    PlanningState,
    ActiveState,
    CompletedState,
    isValidTransition,
};
