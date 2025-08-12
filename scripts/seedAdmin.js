require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../Models/Admin.js');

async function main() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('MONGO_URL is not defined');
    }
    await mongoose.connect(mongoUrl);

    const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@sellup.local';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

    let admin = await Admin.findOne({ email }).lean();
    if (admin) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const { hash } = await Admin.generatePasswordHash(password);
    admin = new Admin({ name, email, password: hash, role: 'admin' });
    await admin.save();
    console.log('Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

main();


