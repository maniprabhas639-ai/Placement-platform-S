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

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: clientOrigin, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] }));

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
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
