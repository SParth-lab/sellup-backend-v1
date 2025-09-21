const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  mobileImage: { 
    type: String, 
    required: [true, 'Mobile image is required'], 
    trim: true 
  },
  webImage: { 
    type: String, 
    required: [true, 'Web image is required'], 
    trim: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required'] 
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

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
