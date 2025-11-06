const mongoose = require('mongoose');
mongoose.set('strictQuery', false); 
async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error('MONGO_URI not provided');
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
