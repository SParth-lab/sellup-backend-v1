const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true }
}, { 
    timestamps: true 
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;