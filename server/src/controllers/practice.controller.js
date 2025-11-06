// server/src/controllers/practice.controller.js
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

/**
 * GET /api/practice/questions
 *
 * Behavior:
 * - Accepts query: category (Aptitude|Technical|HR|Coding|Verbal), difficulty, limit
 * - Maps frontend categories -> DB categories:
 *     Technical -> Coding
 *     HR        -> Verbal
 * - Tries to return `limit` questions matching category+difficulty (random sample).
 * - If not enough exact matches, fills remaining from same category other difficulties.
 */
exports.getQuestions = async (req, res) => {
  try {
    let { category = 'Aptitude', difficulty = 'Medium', limit = 20 } = req.query;
    const size = Math.max(1, Math.min(100, Number(limit) || 20));

    // Map UI category names to stored DB categories
    const categoryMap = {
      Technical: 'Coding',
      HR: 'Verbal'
    };
    const resolvedCategory = categoryMap[category] || category;

    console.log(`[getQuestions] requested category="${category}", resolvedCategory="${resolvedCategory}", difficulty="${difficulty}", limit=${size}`);

    // 1) Try exact match category + difficulty
    const exactMatch = await Question.aggregate([
      { $match: { category: resolvedCategory, difficulty } },
      { $sample: { size } }
    ]);

    if (exactMatch.length >= size) {
      return res.json(exactMatch.slice(0, size));
    }

    // 2) Not enough exact matches: fill remaining from same category (other difficulties)
    const needed = size - exactMatch.length;
    const others = await Question.aggregate([
      { $match: { category: resolvedCategory, difficulty: { $ne: difficulty } } },
      { $sample: { size: needed } }
    ]);

    // Combine and return whatever we have (may be < requested if DB small)
    const combined = [...exactMatch, ...others];
    return res.json(combined);
  } catch (err) {
    console.error('getQuestions error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/practice/submit
 * Accepts answers array: [{ questionId, selectedIndex }, ...]
 * Builds topicResults, correctAnswersMap, questionsSnapshot, saves TestResult.
 */
exports.submitResult = async (req, res) => {
  try {
    console.log('[DEBUG submitResult] req.body =', JSON.stringify(req.body, null, 2));

    const {
      category,
      difficulty,
      answers,
      submissionCode = '',
      language = 'javascript',
      timeTaken = '' // optional: client may send timeTaken string
    } = req.body;

    if (!category || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Missing required fields (category and answers array)' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    // quick map by id
    const qMap = {};
    for (const q of questions) qMap[String(q._id)] = q;

    // compute correctness and topic aggregation
    let correctCount = 0;
    const correctAnswersMap = {};
    const topicAgg = {};
    const snapshotList = [];

    // iterate in the same order as answers array so snapshot is consistent
    for (const a of answers) {
      const qid = String(a.questionId);
      const sel = (typeof a.selectedIndex === 'number') ? Number(a.selectedIndex) : null;
      const q = qMap[qid];

      if (!q) {
        // skip missing question — but still include a minimal snapshot entry
        snapshotList.push({
          _id: qid,
          text: '[question not found]',
          options: [],
          correctIndex: null,
          explanation: ''
        });
        continue;
      }

      correctAnswersMap[qid] = q.correctIndex;
      const isCorrect = sel !== null && Number(q.correctIndex) === sel;
      if (isCorrect) correctCount++;

      // topics
      const topics = Array.isArray(q.topics) && q.topics.length ? q.topics : [q.category || 'General'];
      for (const t of topics) {
        if (!topicAgg[t]) topicAgg[t] = { correct: 0, total: 0 };
        topicAgg[t].total += 1;
        if (isCorrect) topicAgg[t].correct += 1;
      }

      // snapshot object
      snapshotList.push({
        _id: q._id,
        text: q.text,
        options: q.options || [],
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
        topics: q.topics || []
      });
    }

    const total = answers.length;
    const wrongAnswers = total - correctCount;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const topicResults = Object.keys(topicAgg).map(name => {
      const rec = topicAgg[name];
      const pct = rec.total > 0 ? Math.round((rec.correct / rec.total) * 100) : 0;
      return { name, correct: rec.correct, total: rec.total, pct };
    }).sort((a, b) => b.pct - a.pct);

    // create TestResult
    const result = await TestResult.create({
      user: req.user._id,
      category,
      total,
      correctAnswers: correctCount,
      wrongAnswers,
      score,
      difficulty,
      submissionCode,
      language,
      status: 'manual_review',
      topicResults,
      correctAnswersMap,
      questionsSnapshot: snapshotList,
      timeTaken: String(timeTaken || '')
    });

    return res.status(201).json({
      result,
      grading: { total, correctAnswers: correctCount, wrongAnswers, score },
      correctAnswers: correctAnswersMap,
      topicResults
    });
  } catch (err) {
    console.error('submitResult error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/practice/results
 */
exports.getMyResults = async (req, res) => {
  try {
    const results = await TestResult.find({ user: req.user._id }).sort({ submittedAt: -1 }).lean();
    return res.json(results);
  } catch (err) {
    console.error('getMyResults error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/practice/results/:id
 */
exports.getResultById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await TestResult.findById(id).lean();
    if (!result) return res.status(404).json({ message: 'Result not found' });
    if (String(result.user) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    return res.json(result);
  } catch (err) {
    console.error('getResultById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
