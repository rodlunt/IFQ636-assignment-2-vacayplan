// DESIGN PATTERN - BUILDER
// Used to construct Trip update and query objects step-by-step through
// a fluent interface. This centralises object construction logic and
// promotes code reuse across controllers.

const TRIP_UPDATE_FIELDS = [
    'title',
    'destination',
    'startDate',
    'endDate',
    'budget',
    'notes',
    'status',
    'coverPhoto',
];

class TripUpdateBuilder {
    constructor(trip) {
        this.trip = trip;
    }

    withFields(source = {}, fields = TRIP_UPDATE_FIELDS) {
        fields.forEach((field) => {
            if (source[field] !== undefined && source[field] !== null) {
                this.trip[field] = source[field];
            }
        });
        return this;
    }

    build() {
        return this.trip;
    }
}

class TripQueryBuilder {
    constructor() {
        this.filter = {};
        this.sort = {};
    }

    forUser(userId) {
        this.filter.userId = userId;
        return this;
    }

    newestFirst() {
        this.sort.createdAt = -1;
        return this;
    }

    build() {
        return {
            filter: { ...this.filter },
            sort: { ...this.sort },
        };
    }
}

module.exports = {
    TRIP_UPDATE_FIELDS,
    TripUpdateBuilder,
    TripQueryBuilder,
};
