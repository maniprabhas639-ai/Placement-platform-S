// server/src/controllers/interview.controller.js
const Interview = require('../models/Interview');

exports.createInterview = async (req, res) => {
  try {
    const { company, role, date, package: pkg, status, notes, topics } = req.body;
    if (!company || !role || !date) return res.status(400).json({ message: 'company, role and date are required' });

    const interview = await Interview.create({
      user: req.user._id,
      company,
      role,
      date: new Date(date),
      package: pkg || '',
      status: status || 'Pending',
      notes: notes || '',
      topics: Array.isArray(topics) ? topics : []
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error('createInterview error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    // parse query params
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const status = req.query.status; // e.g. 'Pending'
    const q = req.query.q ? String(req.query.q).trim() : '';
    const upcoming = typeof req.query.upcoming !== 'undefined' ? req.query.upcoming === 'true' : undefined;

    // build filter
    const filter = { user: userId };
    if (status) filter.status = status;
    if (q) {
      // case-insensitive partial match on company or role
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ company: re }, { role: re }];
    }
    if (upcoming === true) {
      filter.date = { $gte: new Date() };
    } else if (upcoming === false) {
      filter.date = { $lt: new Date() };
    }

    const total = await Interview.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    const interviews = await Interview.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      interviews,
      meta: {
        total,
        page,
        pages,
        limit
      }
    });
  } catch (err) {
    console.error('getInterviews error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInterviewById = async (req, res) => {
  try {
    const id = req.params.id;
    const interview = await Interview.findOne({ _id: id, user: req.user._id }).lean();
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    console.error('getInterviewById error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// updateInterview and deleteInterview keep same implementation
exports.updateInterview = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const interview = await Interview.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!interview) return res.status(404).json({ message: 'Interview not found or not allowed' });
    res.json(interview);
  } catch (err) {
    console.error('updateInterview error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteInterview = async (req, res) => {
  try {
    const id = req.params.id;
    const interview = await Interview.findOneAndDelete({ _id: id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found or not allowed' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteInterview error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
