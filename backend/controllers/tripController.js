const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

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
        const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

        const { title, destination, startDate, endDate, budget, notes, status, coverPhoto } = req.body;
        trip.title = title ?? trip.title;
        trip.destination = destination ?? trip.destination;
        trip.startDate = startDate ?? trip.startDate;
        trip.endDate = endDate ?? trip.endDate;
        trip.budget = budget ?? trip.budget;
        trip.notes = notes ?? trip.notes;
        trip.status = status ?? trip.status;
        trip.coverPhoto = coverPhoto ?? trip.coverPhoto;

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
