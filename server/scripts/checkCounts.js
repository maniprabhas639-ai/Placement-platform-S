// server/scripts/checkCounts.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const Question = require('../src/models/Question');

async function run() {
  await connectDB(process.env.MONGO_URI);
  const total = await Question.countDocuments();
  const byCat = await Question.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  console.log('Total questions:', total);
  console.log('By category:', byCat);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
