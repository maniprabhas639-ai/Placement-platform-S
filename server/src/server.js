// server/src/server.js
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Routes
const interviewRoutes = require('./routes/interview.routes');
const practiceRoutes = require('./routes/practice.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const resumeRoutes = require('./routes/resume.routes');
const reportRoutes = require('./routes/report.routes');
const mockInterviewRoutes = require('./routes/mockInterview.routes');
const adminMockRoutes = require('./routes/admin.mock.routes');

const DEFAULT_PORT = 5000;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
app.set("trust proxy", 1);
/* -------------------- SECURITY & PERFORMANCE -------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));


if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      try {
        const url = new URL(origin);
        if (url.hostname && url.hostname.endsWith('.vercel.app')) return callback(null, true);
      } catch (e) {
        // fallthrough to rejection
      }
      return callback(new Error('CORS policy: origin not allowed'), false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

/* -------------------- RATE LIMITING -------------------- */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many auth attempts, please try again later' },
});

/* -------------------- ROUTES -------------------- */
// apply auth-specific middleware (smaller body limit + stricter rate limit)
app.use('/api/auth', express.json({ limit: '10kb' }), authLimiter, authRoutes);

// application routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/mock', mockInterviewRoutes);
app.use('/api/admin/mocks', adminMockRoutes);

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => res.json({ ok: true }));

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (err && err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ message: 'CORS origin not allowed' });
  }
  const status = err && err.statusCode ? err.statusCode : 500;
  res.status(status).json({ message: err && err.message ? err.message : 'Internal server error' });
});

/* -------------------- STARTUP -------------------- */
async function startServer() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set — exiting');
    process.exit(1);
  }

  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      await connectDB(uri);
      console.log('MongoDB connected');
      break;
    } catch (err) {
      attempts += 1;
      console.error(`MongoDB connection failed (attempt ${attempts}):`, err && err.message ? err.message : err);
      if (attempts >= maxAttempts) {
        console.error('Exceeded max DB connect attempts — exiting');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000 * attempts));
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (env=${NODE_ENV})`);
  });

  const shutdown = (sig) => {
    console.log(`Received ${sig} — closing server`);
    server.close(() => {
      console.log('HTTP server closed');
      if (typeof connectDB.close === 'function') {
        connectDB.close().then(() => process.exit(0)).catch(() => process.exit(0));
      } else {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  });
}

module.exports = app;
