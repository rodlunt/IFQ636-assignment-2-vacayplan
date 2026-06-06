
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/*
 * Note: there is no POST /api/auth/logout endpoint.
 *
 * The Logout feature (VP-22 user story, VP-46 frontend) is implemented
 * client-side by clearing the JWT from localStorage. JWTs are stateless;
 * there is no server-side session to revoke.
 *
 * Deliberate trade-off accepted in VP-45 / Section 8 Reflection:
 *   - simpler implementation, no token-blacklist store
 *   - no server-side revocation if a token is leaked (mitigated by
 *     short-lived expiry; tokens here are 30d for marker-window
 *     convenience, see VP-42)
 */
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
