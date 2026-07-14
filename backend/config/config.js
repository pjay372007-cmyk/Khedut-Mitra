/**
 * KrishiAI Backend Configuration Manager
 * Loads, verifies, and provides safe defaults for all environment variables.
 */

require('dotenv').config();

const config = {
    port: parseInt(process.env.PORT, 10) || 5000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_key_change_in_production',
    sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret_key',
    
    // AI Integration Keys
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    
    // Twilio SMS integration keys (used for future real OTP validations)
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
    },

    // Database connection string
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/krishiai',

    // Rate Limiting settings
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100 // limit each IP to 100 requests per windowMs
    }
};

module.exports = config;
