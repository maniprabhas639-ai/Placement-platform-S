// server/src/controllers/adminMock.controller.js
const MockInterview = require('../models/MockInterview');
const User = require('../models/User');

/**
 * GET /api/admin/mocks
 * Query: ?type=HR|Technical&limit=50&skip=0
 * Returns latest mock interviews (populates user).
 */
exports.listMocks = async (req, res) => {
  try {
    const { type, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const mocks = await MockInterview.find(filter)
      .sort({ submittedAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(200, Number(limit)))
      .populate('user', 'name email')
      .lean();

    res.json(mocks);
  } catch (err) {
    console.error('adminMock.listMocks error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/mocks/:id
 * Return a single mock interview with user info.
 */
exports.getMock = async (req, res) => {
  try {
    const id = req.params.id;
    const m = await MockInterview.findById(id).populate('user', 'name email').lean();
    if (!m) return res.status(404).json({ message: 'Mock not found' });
    res.json(m);
  } catch (err) {
    console.error('adminMock.getMock error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /api/admin/mocks/:id
 * Body: { score, feedback }
 * Admin updates score/feedback.
 */
exports.updateMock = async (req, res) => {
  try {
    const id = req.params.id;
    const { score, feedback } = req.body;
    const updates = {};

    if (typeof score === 'number') updates.score = Math.round(score);
    if (typeof feedback === 'string') updates.feedback = feedback;

    updates.reviewedAt = new Date();
    const updated = await MockInterview.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Mock not found' });

    res.json(updated);
  } catch (err) {
    console.error('adminMock.updateMock error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
