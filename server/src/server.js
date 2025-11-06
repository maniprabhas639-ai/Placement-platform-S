// server/src/server.js
require('dotenv').config();
const interviewRoutes = require('./routes/interview.routes');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const practiceRoutes = require('./routes/practice.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const resumeRoutes = require('./routes/resume.routes');
const reportRoutes = require('./routes/report.routes');
const mockInterviewRoutes = require('./routes/mockInterview.routes');
const adminMockRoutes = require('./routes/admin.mock.routes');

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json({ limit: '10kb' })); // small limit for auth payloads
app.use(express.urlencoded({ extended: true }));

/**
 * CORS: allow multiple origins (production Vercel + local dev).
 * The CLIENT_URL env var (set on Render) should be your Vercel origin,
 * for example: "https://placement-platform-xxxx.vercel.app"
 *
 * This function:
 *  - allows requests without origin (curl / server-to-server)
 *  - allows localhost dev origins
 *  - allows the production origin if supplied via CLIENT_URL
 */
// CORS: allow explicit CLIENT_URL, localhost, and any vercel.app subdomain
const allowedOrigins = [
  process.env.CLIENT_URL,       // exact production origin if set
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // allow explicit list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // allow any vercel.app subdomain (returns the specific origin so browser accepts it)
    try {
      const url = new URL(origin);
      if (url.hostname && url.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch (e) {
      // fallthrough to rejection
    }

    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());


// Connect DB
connectDB(process.env.MONGO_URI);

// Routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/mock', mockInterviewRoutes);
app.use('/api/admin/mocks', adminMockRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // If this is a CORS rejection we can return 403 to make debugging clearer
  if (err && err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ message: 'CORS origin not allowed' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

