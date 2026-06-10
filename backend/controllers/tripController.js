const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const { TripQueryBuilder, TripUpdateBuilder } = require('../builders/tripBuilders');

const createTrip = async (req, res) => {
    const { title, destination, startDate, endDate, budget, notes, status, coverPhoto } = req.body;
    try {
        const trip = await Trip.create({
            title,
            destination,
            startDate,
            endDate,
            budget,
            notes,
            status,
            coverPhoto,
            userId: req.user._id,
        });
        res.status(201).json(trip);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const getTrips = async (req, res) => {
    try {
        const tripQuery = new TripQueryBuilder()
            .forUser(req.user._id)
            .newestFirst()
            .build();

        const trips = await Trip.find(tripQuery.filter).sort(tripQuery.sort);
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        new TripUpdateBuilder(trip)
            .withFields(req.body)
            .build();

        const updated = await trip.save();
        res.json(updated);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        await Activity.deleteMany({ tripId: trip._id });
        await trip.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
