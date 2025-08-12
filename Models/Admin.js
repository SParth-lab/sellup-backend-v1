const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, match: [/.+\@.+\..+/, 'Invalid email'] },
  password: { type: String, required: true },
  role: { type: String, default: 'admin', enum: ['admin'] },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

adminSchema.statics.generatePasswordHash = async function(password) {
  const hash = await bcrypt.hash(password, 10);
  return { hash };
};

adminSchema.statics.comparePassword = async function(candidatePassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
    if (!isMatch) {
      return { err: true };
    }
    return { result: true };
  } catch (err) {
    return { err: true };
  }
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;


