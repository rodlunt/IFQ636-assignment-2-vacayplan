const express = require('express');
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { withOwnership } = require('../middleware/ownershipDecorator');

const router = express.Router();

router.post('/', protect, createTrip);
router.get('/', protect, getTrips);
router.get('/:id', protect, withOwnership(getTripById));
router.put('/:id', protect, withOwnership(updateTrip));
router.delete('/:id', protect, withOwnership(deleteTrip));

module.exports = router;
