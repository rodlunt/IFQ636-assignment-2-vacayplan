const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const SEED_USERS = [
    {
        name: 'Marker Test',
        email: 'marker@vacayplan.com',
        password: 'MarkerPass123!',
        isAdmin: false,
    },
    {
        name: 'Admin Test',
        email: 'admin@vacayplan.com',
        password: 'AdminPass123!',
        isAdmin: true,
    },
];

const seedUsers = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set. Cannot seed users.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    try {
        for (const seed of SEED_USERS) {
            const existing = await User.findOne({ email: seed.email });
            if (existing) {
                console.log(`User already exists (${seed.email}); skipping.`);
                continue;
            }
            await User.create(seed);
            console.log(`Seeded user: ${seed.email} (isAdmin=${seed.isAdmin})`);
        }
    } finally {
        await mongoose.disconnect();
    }
};

if (require.main === module) {
    seedUsers()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Seed failed:', err.message);
            process.exit(1);
        });
}

module.exports = { seedUsers, SEED_USERS };
