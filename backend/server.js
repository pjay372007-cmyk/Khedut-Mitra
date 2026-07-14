/**
 * KrishiAI Backend Server Scaffolding Entrypoint
 * Configures HTTP security headers, CORS origins, API gateway routes, and crash-resilient error boundaries.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const apiRoutes = require('./routes/api');
const connectDB = require('./config/db');

const app = express();

// 1. HTTP Security Headers configuration (Prevents XSS, frame injection, MIME-sniffing)
app.use(helmet());

// 2. CORS configuration — environment-aware allowlist (no wildcard in production)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5500',  // VS Code Live Server
        'http://127.0.0.1:3000',
        'null',                    // file:// PWA during local dev
      ];

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no origin (server-to-server, curl, mobile apps)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


// 3. Request Parsers (Handles JSON and url-encoded form values)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. API Routes registration
app.use('/api', apiRoutes);

// 5. Root Health Check probe route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        env: config.env,
        services: {
            database: "disconnected_placeholder",
            smsGateway: "mock_active"
        }
    });
});

// 6. 404 Route handler
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// 7. Centralized global error handling boundary middleware (Blocks process-crashing unhandled exceptions)
app.use((err, req, res, next) => {
    console.error(`[GlobalErrorCatch] Internal server error: ${err.message}`, err.stack);
    
    // Shield stack traces from raw output during production deployment
    const message = config.env === 'production' 
        ? "A server error occurred. Please contact system support." 
        : err.message;

    return res.status(err.status || 500).json({
        status: err.status || 500,
        error: message
    });
});

// 8. Start server execution
const startServer = async () => {
    // Connect to database (with automatic fallback)
    await connectDB();

    const serverInstance = app.listen(config.port, () => {
        console.log(`===========================================================`);
        console.log(`🚀 KrishiAI API Server running at http://localhost:${config.port}`);
        console.log(`🛡️  Security Headers (Helmet) & CORS profiles configured.`);
        console.log(`🔋 Port: ${config.port} | Mode: ${config.env}`);
        console.log(`===========================================================`);
    });

    // Handle termination signals gracefully
    process.on('SIGTERM', () => {
        console.log('[SIGTERM] Shutting down API gateway server gracefully...');
        serverInstance.close(() => {
            console.log('[OK] Server closed successfully.');
            process.exit(0);
        });
    });
};

startServer();
