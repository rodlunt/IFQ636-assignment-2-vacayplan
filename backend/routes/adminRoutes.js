const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const { validate, requireUserFields, requireValidStatus } = require('../middleware/validateMiddleware');
const { createUser, listAllUsers, getUserDetail, updateUserStatus, deleteUser, listAllTrips } = require('../controllers/adminController');

const router = express.Router();

// CHAIN OF RESPONSIBILITY assembly point: each admin route runs the same
// chain of links - protect (401 or pass) -> adminProtect (403 or pass) ->
// validate (400 or pass, where the route has a body to check) -> controller.
// A request only reaches business logic after every link has passed it on.
router.post('/users', protect, adminProtect, validate([requireUserFields]), createUser);
router.get('/users', protect, adminProtect, listAllUsers);
router.get('/users/:id', protect, adminProtect, getUserDetail);
router.patch('/users/:id', protect, adminProtect, validate([requireValidStatus]), updateUserStatus);
router.delete('/users/:id', protect, adminProtect, deleteUser);
router.get('/trips', protect, adminProtect, listAllTrips);

module.exports = router;
