/**
 * KrishiAI API Rate Limiting Middleware
 * Implements security boundaries to prevent brute-force login attempts and API request flooding.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Standard API rate limiter (protects all API endpoints)
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        error: "Too many requests from this IP address. Please try again after 15 minutes."
    }
});

// Stricter limiter for sensitive login/OTP verification routes
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 5, // Limit each IP to 5 requests per windowMs (e.g., OTP requests)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many login attempts. Please try again after 5 minutes."
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};
