/**
 * KrishiAI Express Router
 * Declares all API routes and binds authorization and rate-limiting middlewares.
 */

const express = require('express');
const router = express.Router();

// Middlewares
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

// Controllers
const authController = require('../controllers/authController');
const weatherController = require('../controllers/weatherController');

// Apply base api rate limiter globally across all API router subpaths
router.use(apiLimiter);

// ──────────────────────────────────────────────────────────────────────────────
// Authentication & OTP Routes
// ──────────────────────────────────────────────────────────────────────────────
// Limit OTP requests strictly to 5 per IP every 5 minutes
router.post('/auth/otp/request', authLimiter, authController.requestOtp);
router.post('/auth/otp/verify', authLimiter, authController.verifyOtp);

// ──────────────────────────────────────────────────────────────────────────────
// Farmer Profiles Routes (Session JWT protected)
// ──────────────────────────────────────────────────────────────────────────────
router.post('/profile', authMiddleware, authController.saveProfile);
router.get('/profile', authMiddleware, authController.getProfile);

// ──────────────────────────────────────────────────────────────────────────────
// Weather & Advisory Routes
// ──────────────────────────────────────────────────────────────────────────────
router.get('/weather/forecast', weatherController.getWeatherForecast);

module.exports = router;
