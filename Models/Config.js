const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  googleAdsUnitId: { 
    type: String, 
    required: [false, 'Google Ads Unit ID is optional'], 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true,
  versionKey: false // Disable the __v field
});

const Config = mongoose.model("Config", configSchema);
module.exports = Config;
