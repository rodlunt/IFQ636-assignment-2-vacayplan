const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ['booked', 'wishlist'],
        default: 'wishlist',
    },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
