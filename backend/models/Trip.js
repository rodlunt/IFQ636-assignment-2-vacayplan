const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return !this.startDate || value >= this.startDate;
            },
            message: 'End date must be on or after start date',
        },
    },
    budget: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed'],
        default: 'planning',
        index: true,
    },
    coverPhoto: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
