const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    addActivity,
    listActivitiesForTrip,
    updateActivity,
    deleteActivity,
    updateActivityStatus,
} = require('../controllers/activityController');

const router = express.Router({ mergeParams: true });

router.post('/', protect, addActivity);
router.get('/', protect, listActivitiesForTrip);
router.put('/:activityId', protect, updateActivity);
router.delete('/:activityId', protect, deleteActivity);
router.patch('/:activityId/status', protect, updateActivityStatus);

module.exports = router;
