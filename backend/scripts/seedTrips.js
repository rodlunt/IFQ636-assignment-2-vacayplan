const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

const MARKER_EMAIL = 'marker@vacayplan.com';

const SEED_TRIPS = [
    {
        title: 'Bali getaway',
        destination: 'Bali, Indonesia',
        startDate: new Date('2026-06-12'),
        endDate: new Date('2026-06-19'),
        budget: 2400,
        status: 'active',
        coverPhoto: '/trip-covers/bali.webp',
        notes: 'Family escape — relaxed pace, mix of resort + cultural day trips.',
        activities: [
            { date: new Date('2026-06-12'), time: '07:30', location: 'Sydney Kingsford Smith (SYD)', description: 'Fly QF41 SYD → DPS', status: 'booked' },
            { date: new Date('2026-06-12'), time: '17:00', location: 'Layar Villa, Seminyak', description: 'Check in to Layar Villa', status: 'booked' },
            { date: new Date('2026-06-13'), time: '09:00', location: 'Ubud, Bali', description: 'Ubud Rice Terrace tour', status: 'booked' },
        ],
    },
    {
        title: 'Tokyo planning',
        destination: 'Tokyo, Japan',
        startDate: new Date('2026-09-03'),
        endDate: new Date('2026-09-10'),
        budget: 3100,
        status: 'planning',
        coverPhoto: '/trip-covers/tokyo.webp',
        notes: 'First Japan trip — still pricing flights and ryokan options.',
        activities: [
            { date: new Date('2026-09-03'), time: '21:30', location: 'Sydney Kingsford Smith (SYD)', description: 'Flight JL771 SYD → HND (overnight)', status: 'wishlist' },
            { date: new Date('2026-09-05'), time: '15:00', location: 'Shibuya, Tokyo', description: 'Shibuya Crossing photo + Hachiko statue walking tour', status: 'wishlist' },
            { date: new Date('2026-09-07'), time: '08:00', location: 'Tsukiji Outer Market', description: 'Sushi breakfast + kitchenware shopping', status: 'wishlist' },
        ],
    },
    {
        title: 'Paris 2025',
        destination: 'Paris, France',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-15'),
        budget: 4200,
        status: 'completed',
        coverPhoto: '/trip-covers/paris.webp',
        notes: 'Honeymoon — done; kept for memories.',
        activities: [
            { date: new Date('2025-09-06'), time: '14:00', location: 'Champ de Mars, Paris', description: 'Eiffel Tower summit visit', status: 'booked' },
            { date: new Date('2025-09-08'), time: '10:00', location: 'Rue de Rivoli, Paris', description: 'Louvre Museum — Denon wing', status: 'booked' },
            { date: new Date('2025-09-11'), time: '11:30', location: 'Montmartre, Paris', description: 'Sacré-Cœur + Place du Tertre walking tour', status: 'booked' },
        ],
    },
];

const seedTrips = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set. Cannot seed trips.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    try {
        const marker = await User.findOne({ email: MARKER_EMAIL });
        if (!marker) {
            console.log(`Marker user (${MARKER_EMAIL}) not found; skipping trip seed. Run seedUsers first.`);
            return;
        }

        const existingCount = await Trip.countDocuments({ userId: marker._id });
        if (existingCount > 0) {
            console.log(`Marker already has ${existingCount} trip(s); skipping trip seed (idempotent).`);
            return;
        }

        for (const { activities, ...tripFields } of SEED_TRIPS) {
            const trip = await Trip.create({ ...tripFields, userId: marker._id });
            const activityDocs = activities.map((a) => ({ ...a, tripId: trip._id }));
            await Activity.insertMany(activityDocs);
            console.log(`Seeded trip: ${trip.destination} (${trip.status}) with ${activities.length} activities`);
        }
    } finally {
        await mongoose.disconnect();
    }
};

if (require.main === module) {
    seedTrips()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Trip seed failed:', err.message);
            process.exit(1);
        });
}

module.exports = { seedTrips, SEED_TRIPS };
