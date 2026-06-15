const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const { TripQueryBuilder, TripUpdateBuilder } = require('../builders/tripBuilders');
const tripService = require('../services/tripService');

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

const getTripById = (req, res) => {
    res.json(req.trip);
};

const updateTrip = async (req, res) => {
    try {
        new TripUpdateBuilder(req.trip)
            .withFields(req.body)
            .build();
        const updated = await req.trip.save();
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
        await tripService.deleteTripWithActivities(req.trip);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
