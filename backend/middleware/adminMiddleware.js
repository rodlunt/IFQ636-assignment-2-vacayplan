// Second link in the request chain (Chain of Responsibility - see
// middleware/validateMiddleware.js): handles non-admin requests with
// 401/403, passes admin requests to the next link via next().
const adminProtect = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

module.exports = { adminProtect };
