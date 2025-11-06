// server/src/controllers/report.controller.js
const TestResult = require('../models/TestResult');

/**
 * GET /api/report
 * Returns aggregated stats for the authenticated user.
 */
exports.userReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1) Basic aggregates: totalAttempts, averageScore
    const aggBasic = await TestResult.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          attempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          latest: { $max: '$submittedAt' }
        }
      }
    ]);

    const basic = aggBasic[0] || { attempts: 0, avgScore: 0 };

    // 2) Per-category averages and counts
    const perCategory = await TestResult.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgScore: -1 } } // highest first
    ]);

    // 3) Recent attempts (last 10)
    const recent = await TestResult.find({ user: userId })
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('category score total correctAnswers wrongAnswers submittedAt status')
      .lean();

    // Map perCategory to a friendly format
    const categories = perCategory.map(p => ({
      category: p._id,
      avgScore: Math.round(p.avgScore || 0),
      count: p.count
    }));

    res.json({
      attempts: basic.attempts || 0,
      avgScore: Math.round(basic.avgScore || 0),
      categories,
      recent
    });
  } catch (err) {
    console.error('report.userReport error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
