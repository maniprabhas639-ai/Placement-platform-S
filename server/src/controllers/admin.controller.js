// server/src/controllers/admin.controller.js
const TestResult = require('../models/TestResult');
const User = require('../models/User');

/**
 * GET /api/admin/submissions
 * Query params: status, category, limit, skip
 */
exports.listSubmissions = async (req, res) => {
  try {
    const { status, category, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const results = await TestResult.find(filter)
      .sort({ submittedAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 200))
      .populate('user', 'name email')
      .lean();

    res.json(results);
  } catch (err) {
    console.error('admin.listSubmissions error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /api/admin/submissions/:id
 * Body: { status, score, correctAnswers, wrongAnswers, adminNotes }
 */
exports.updateSubmission = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = {};
    const allowed = ['status', 'score', 'correctAnswers', 'wrongAnswers', 'adminNotes'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.reviewedAt = new Date();

    const updated = await TestResult.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Submission not found' });
    res.json(updated);
  } catch (err) {
    console.error('admin.updateSubmission error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
