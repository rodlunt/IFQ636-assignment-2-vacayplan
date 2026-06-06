const express = require('express');
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createTrip);
router.get('/', protect, getTrips);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
