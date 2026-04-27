const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }));

    const users = await User.find({}, 'name email role');
    console.log('Users found:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
