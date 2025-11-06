// server/src/controllers/mockInterview.controller.js
const MockInterview = require('../models/MockInterview');

// pre-defined question sets (later we can store in DB)
const HR_QUESTIONS = [
  'Tell me about yourself.',
  'Why should we hire you?',
  'Describe a challenging situation you faced and how you handled it.',
  'What are your strengths and weaknesses?',
  'Where do you see yourself in five years?'
];

const TECH_QUESTIONS = [
  'Explain the concept of closures in JavaScript.',
  'What is REST API and how does it work?',
  'Describe normalization in databases.',
  'Explain the difference between HTTP and HTTPS.',
  'What are React hooks and why are they useful?'
];

// start a new mock interview
exports.startMock = async (req, res) => {
  try {
    const { type } = req.body;
    if (!['HR', 'Technical'].includes(type)) {
      return res.status(400).json({ message: 'Invalid mock interview type' });
    }

    const questions = type === 'HR' ? HR_QUESTIONS : TECH_QUESTIONS;
    const interview = await MockInterview.create({
      user: req.user._id,
      type,
      questions,
      responses: []
    });

    return res.status(201).json(interview);
  } catch (err) {
    console.error('startMock error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// submit responses
exports.submitMock = async (req, res) => {
  try {
    const { interviewId, responses } = req.body;
    if (!interviewId || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const interview = await MockInterview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    interview.responses = responses;
    // placeholder scoring (later can use AI)
    const answered = responses.filter(r => r && r.trim().length > 0).length;
    interview.score = Math.round((answered / interview.questions.length) * 100);
    interview.feedback = 'Responses recorded. Awaiting review.';
    await interview.save();

    return res.json(interview);
  } catch (err) {
    console.error('submitMock error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get user mock interview history
exports.getMocks = async (req, res) => {
  try {
    const mocks = await MockInterview.find({ user: req.user._id }).sort({ submittedAt: -1 });
    res.json(mocks);
  } catch (err) {
    console.error('getMocks error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
