const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const { createUser, listAllUsers, getUserDetail, updateUserStatus, deleteUser, listAllTrips } = require('../controllers/adminController');

const router = express.Router();

router.post('/users', protect, adminProtect, createUser);
router.get('/users', protect, adminProtect, listAllUsers);
router.get('/users/:id', protect, adminProtect, getUserDetail);
router.patch('/users/:id', protect, adminProtect, updateUserStatus);
router.delete('/users/:id', protect, adminProtect, deleteUser);
router.get('/trips', protect, adminProtect, listAllTrips);

module.exports = router;
