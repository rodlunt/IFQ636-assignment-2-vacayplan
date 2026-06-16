const Activity = require('../models/Activity');

const addActivity = async (req, res) => {
    try {
        const trip = req.trip;
        const { date, time, location, description, status } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'date is required' });
        }

        const activityDate = new Date(date);
        if (activityDate < trip.startDate || activityDate > trip.endDate) {
            return res.status(400).json({ message: 'Activity date must fall within the trip date range' });
        }

        const activity = await Activity.create({
            tripId: trip._id,
            date: activityDate,
            time,
            location,
            description,
            status,
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listActivitiesForTrip = async (req, res) => {
    try {
        const activities = await Activity.find({ tripId: req.trip._id }).sort({ date: 1, time: 1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.activityId);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        if (activity.tripId.toString() !== req.trip._id.toString()) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const { date, time, location, description, status } = req.body;

        if (date !== undefined) {
            const activityDate = new Date(date);
            if (activityDate < req.trip.startDate || activityDate > req.trip.endDate) {
                return res.status(400).json({ message: 'Activity date must fall within the trip date range' });
            }
            activity.date = activityDate;
        }
        if (time !== undefined) activity.time = time;
        if (location !== undefined) activity.location = location;
        if (description !== undefined) activity.description = description;
        if (status !== undefined) activity.status = status;

        const updated = await activity.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.activityId);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        if (activity.tripId.toString() !== req.trip._id.toString()) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        await activity.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivityStatus = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.activityId);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        if (activity.tripId.toString() !== req.trip._id.toString()) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const { status } = req.body;
        if (status !== 'booked' && status !== 'wishlist') {
            return res.status(400).json({ message: "status must be 'booked' or 'wishlist'" });
        }

        activity.status = status;
        const updated = await activity.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addActivity,
    listActivitiesForTrip,
    updateActivity,
    deleteActivity,
    updateActivityStatus,
};
