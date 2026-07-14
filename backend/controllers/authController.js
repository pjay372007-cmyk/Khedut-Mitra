/**
 * KrishiAI Authentication Controller
 * Orchestrates OTP requests, registration payloads validations, and logins.
 */

const Joi      = require('joi');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const config   = require('../config/config');
const UserModel = require('../models/User');
const OtpModel  = require('../models/Otp');

// Input validation schemas
const mobileSchema = Joi.object({
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required()
        .messages({ 'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number.' })
});

const verifyOtpSchema = Joi.object({
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    otp: Joi.string().length(6).required()
});

const profileSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    village: Joi.string().allow(''),
    taluka: Joi.string().allow(''),
    district: Joi.string().required(),
    land: Joi.number().min(0).required()
});

// Mock user profiles in memory (for offline fallback checks)
const tempDb = {
    profiles: {},
    activeOtps: {}
};

const authController = {
    /**
     * Triggers OTP creation.
     */
    async requestOtp(req, res) {
        const { error, value } = mobileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { mobile } = value;
        // Generate secure 6-digit OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        try {
            if (mongoose.connection.readyState === 1) {
                // Connected to MongoDB - upsert verification record
                await OtpModel.findOneAndUpdate(
                    { mobile },
                    { otp, expiry: new Date(Date.now() + 5 * 60 * 1000) },
                    { upsert: true, new: true }
                );
            } else {
                // Fallback: Save to temporary memory database with 5 min expiration
                tempDb.activeOtps[mobile] = {
                    otp,
                    expiry: Date.now() + 5 * 60 * 1000
                };
            }

            if (config.env !== 'production') {
                console.log(`[SMS Gateway Mock] Sent OTP ${otp} to +91 ${mobile}`);
            }
            // NOTE: In production, integrate Twilio/MSG91 here.
            // NEVER return the OTP in the API response.

            return res.status(200).json({
                message: 'OTP sent successfully to +91 ' + mobile.slice(0, 2) + 'XXXXXX' + mobile.slice(-2),
                mobile,
            });
        } catch (err) {
            console.error('[authController.requestOtp] Error occurred:', err.message);
            return res.status(500).json({ error: "Failed to request verification code due to a server error." });
        }
    },

    /**
     * Verifies the OTP and issues a session token.
     */
    async verifyOtp(req, res) {
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { mobile, otp } = value;
        
        try {
            let activeRecord;
            if (mongoose.connection.readyState === 1) {
                activeRecord = await OtpModel.findOne({ mobile });
            } else {
                activeRecord = tempDb.activeOtps[mobile];
            }

            if (!activeRecord) {
                return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
            }

            const isExpired = activeRecord.expiry instanceof Date 
                ? Date.now() > activeRecord.expiry.getTime()
                : Date.now() > activeRecord.expiry;

            if (isExpired) {
                if (mongoose.connection.readyState === 1) {
                    await OtpModel.deleteOne({ mobile });
                } else {
                    delete tempDb.activeOtps[mobile];
                }
                return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
            }

            if (activeRecord.otp !== otp) {
                return res.status(400).json({ error: "Incorrect verification code." });
            }

            // Successfully matched - clear OTP
            if (mongoose.connection.readyState === 1) {
                await OtpModel.deleteOne({ mobile });
            } else {
                delete tempDb.activeOtps[mobile];
            }

            // Check if user has registered profile
            let isRegistered = false;
            if (mongoose.connection.readyState === 1) {
                const user = await UserModel.findOne({ mobile });
                isRegistered = !!user;
            } else {
                isRegistered = !!tempDb.profiles[mobile];
            }

            // Generate a signed JWT token using the configured secret
            const token = jwt.sign(
                { mobile, iat: Math.floor(Date.now() / 1000) },
                config.jwtSecret,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Authentication successful.',
                token,
                isRegistered,
                mobile
            });
        } catch (err) {
            console.error('[authController.verifyOtp] Error occurred:', err.message);
            return res.status(500).json({ error: "Verification failed due to a server error." });
        }
    },

    /**
     * Saves farmer registration details.
     */
    async saveProfile(req, res) {
        const { error, value } = profileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const mobile = req.user?.mobile;
        if (!mobile) {
            return res.status(401).json({ error: "Session mobile context missing. Please login again." });
        }

        try {
            if (mongoose.connection.readyState === 1) {
                const profile = await UserModel.findOneAndUpdate(
                    { mobile },
                    { ...value, mobile },
                    { upsert: true, new: true }
                );
                return res.status(200).json({
                    message: "Farmer profile registered successfully.",
                    profile
                });
            } else {
                tempDb.profiles[mobile] = {
                    ...value,
                    mobile,
                    timestamp: Date.now()
                };

                return res.status(200).json({
                    message: "Farmer profile registered successfully.",
                    profile: tempDb.profiles[mobile]
                });
            }
        } catch (err) {
            console.error('[authController.saveProfile] Error occurred:', err.message);
            return res.status(500).json({ error: "Failed to save profile due to a server error." });
        }
    },

    /**
     * Fetches details of the active farmer.
     */
    async getProfile(req, res) {
        const mobile = req.user?.mobile;
        if (!mobile) {
            return res.status(401).json({ error: "Access denied: Login session required." });
        }

        try {
            if (mongoose.connection.readyState === 1) {
                const profile = await UserModel.findOne({ mobile });
                if (!profile) {
                    return res.status(404).json({ error: "Profile details not found for this mobile number." });
                }
                return res.status(200).json({ profile });
            } else {
                const profile = tempDb.profiles[mobile];
                if (!profile) {
                    return res.status(404).json({ error: "Profile details not found for this mobile number." });
                }
                return res.status(200).json({ profile });
            }
        } catch (err) {
            console.error('[authController.getProfile] Error occurred:', err.message);
            return res.status(500).json({ error: "Failed to fetch profile due to a server error." });
        }
    }
};

module.exports = authController;

module.exports = authController;
