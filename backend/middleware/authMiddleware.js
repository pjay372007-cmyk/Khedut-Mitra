/**
 * KrishiAI Authentication & Session Token Middleware
 * Verifies JWT signatures, parses bearer headers, and populates req.user.
 */

const jwt    = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 401,
                error: 'Access Denied: Missing authorization headers. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 401,
                error: 'Access Denied: Token format is invalid.'
            });
        }

        // Verify the JWT signature using the configured secret
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = {
            mobile: decoded.mobile,
            role:   decoded.role || 'farmer',
        };
        return next();

    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 401, error: 'Session expired. Please login again.' });
        }
        if (e.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 401, error: 'Invalid authentication token.' });
        }
        console.error('[AuthMiddleware] Unexpected error:', e.message);
        return res.status(500).json({
            status: 500,
            error: 'Authentication encountered an internal error.'
        });
    }
};

module.exports = authMiddleware;
