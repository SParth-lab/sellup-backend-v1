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
  isAdEnable: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  categoryOrder: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    sortOrder: {
      type: Number,
      required: true
    }
  }]
}, { 
  timestamps: true,
  versionKey: false // Disable the __v field
});

const Config = mongoose.model("Config", configSchema);
module.exports = Config;
