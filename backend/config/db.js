/**
 * KrishiAI Database Connection Manager
 * Establishes MongoDB connection using Mongoose, with graceful fallback hooks.
 */

const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        if (!config.dbUri) {
            console.warn("[Database] No DB_URI configured. Running server in temporary in-memory database mode.");
            return false;
        }

        // Setup options
        const options = {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(config.dbUri, options);
        console.log("===========================================================");
        console.log("🔋 [Database] MongoDB Connected successfully.");
        console.log("===========================================================");
        return true;
    } catch (err) {
        console.error("❌ [Database] MongoDB connection error:", err.message);
        console.warn("⚠️ [Database] Falling back to temporary in-memory database mode.");
        return false;
    }
};

module.exports = connectDB;
