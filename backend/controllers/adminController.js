const User = require('../models/User');
const Trip = require('../models/Trip');
const UserResponseFactory = require('../factories/userResponseFactory');
const userService = require('../services/userService');

// Required-field validation now runs in the validate chain link (see
// middleware/validateMiddleware.js + adminRoutes.js) before this handler.
const createUser = async (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, isAdmin: !!isAdmin });
        res.status(201).json(UserResponseFactory.create('admin', user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const trips = await Trip.find({ userId: user._id }).sort({ startDate: -1 });
        res.json({ ...user.toObject(), trips });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Status-value validation now runs in the validate chain link; only the
// stateful rule (already-active check, needs the DB record) stays here.
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (status === 'active' && user.status !== 'deactivated') {
            return res.status(400).json({ message: 'User is already active' });
        }
        user.status = status;
        const updated = await user.save();
        res.json(UserResponseFactory.create('admin', updated));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await userService.deleteUserWithCascade(user, req.user);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, listAllUsers, getUserDetail, updateUserStatus, deleteUser, listAllTrips };
