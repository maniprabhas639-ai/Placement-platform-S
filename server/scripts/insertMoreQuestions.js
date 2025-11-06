// server/scripts/insertMoreQuestions.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Question = require('../src/models/Question');

const extra = [
  // Aptitude (2)
  {
    text: "A bag contains 3 red and 2 blue balls. One ball is drawn at random. What is probability it is red?",
    options: ["1/5", "3/5", "2/5", "3/2"],
    correctIndex: 1,
    explanation: "3 red out of total 5 → 3/5.",
    category: "Aptitude",
    difficulty: "Easy"
  },
  {
    text: "If the perimeter of a square is 48 cm, what is its area?",
    options: ["144 cm2", "144 cm", "256 cm2", "196 cm2"],
    correctIndex: 0,
    explanation: "Side = 48/4 = 12; area = 12*12 = 144 cm^2.",
    category: "Aptitude",
    difficulty: "Easy"
  },

  // Coding (2)
  {
    text: "Which data structure offers average O(1) time for insert, delete and lookup?",
    options: ["Array", "Linked List", "Hash Table", "Binary Tree"],
    correctIndex: 2,
    explanation: "Hash tables offer average O(1) for these operations.",
    category: "Coding",
    difficulty: "Easy"
  },
  {
    text: "What does BFS (Breadth-First Search) use to keep track of nodes to visit?",
    options: ["Stack", "Queue", "Priority Queue", "Set"],
    correctIndex: 1,
    explanation: "BFS uses a queue to traverse by levels.",
    category: "Coding",
    difficulty: "Easy"
  },

  // Verbal (1)
  {
    text: "Choose the word that best completes the sentence: 'Her argument was _____, convincing even the critics.'",
    options: ["tenuous", "compelling", "vague", "irrelevant"],
    correctIndex: 1,
    explanation: "Compelling means persuasive; fits the sentence.",
    category: "Verbal",
    difficulty: "Medium"
  }
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await connectDB(process.env.MONGO_URI);
  const inserted = await Question.insertMany(extra);
  console.log(`Inserted ${inserted.length} extra questions.`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
