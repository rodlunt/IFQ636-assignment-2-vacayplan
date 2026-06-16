const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    addActivity,
    listActivitiesForTrip,
    updateActivity,
    deleteActivity,
    updateActivityStatus,
} = require('../controllers/activityController');
const { withOwnership } = require('../middleware/ownershipDecorator');

const router = express.Router({ mergeParams: true });

router.post('/', protect, withOwnership(addActivity));
router.get('/', protect, withOwnership(listActivitiesForTrip));
router.put('/:activityId', protect, withOwnership(updateActivity));
router.delete('/:activityId', protect, withOwnership(deleteActivity));
router.patch('/:activityId/status', protect, withOwnership(updateActivityStatus));

module.exports = router;
