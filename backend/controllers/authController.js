const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserResponseFactory = require('../factories/userResponseFactory');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password });
        res.status(201).json(UserResponseFactory.create('auth', user, generateToken(user.id)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.status === 'deactivated') {
                return res.status(403).json({ message: 'Account is deactivated' });
            }
            res.json(UserResponseFactory.create('auth', user, generateToken(user.id)));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        university: user.university,
        address: user.address,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.university = university || user.university;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.json(UserResponseFactory.create('auth', updatedUser, generateToken(updatedUser.id)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
