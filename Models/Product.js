const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Product title is required'], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'], 
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'], 
    min: [0, 'Price must be a positive number'] 
  },
  discountPrice: { 
    type: Number, 
    required: [true, 'Product discount price is required'], 
    min: [0, 'Discount price must be a positive number'] 
  },
  category: { 
    type: String, 
    required: [true, 'Product category is required'], 
    trim: true 
  },
  subCategory: { 
    type: String, 
    required: [false, 'Product sub-category is optional'], 
    trim: true 
  },
  location: { 
    type: {
      address: { type: String, required: [true, 'Address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      area: { type: String, required: [true, 'Area is required'], trim: true },
      country: { type: String, required: [true, 'Country is required'], trim: true },
      zipCode: { type: String, required: [true, 'Zip code is required'], trim: true }
    },
    required: [true, 'Product location is required']
  },
  compressedImages: { 
    type: [{ type: String, required: true }], 
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'A product can have a maximum of 5 images'
    }
  },
  images: { 
    type: [{ type: String, required: true }], 
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'A product can have a maximum of 5 images'
    }
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, 'Category ID is required'] 
  },
  isDelete: { 
    type: Boolean, 
    default: false 
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  isCall : {
    type: Boolean,
    default: false
  },
  isWhatsapp : {
    type: Boolean,
    default: false
  },
  rentType: { 
    type: String, 
    required: [true, 'Rent type is required'], 
    trim: true 
  },
  discount: { 
    type: Number, 
    required: [true, 'Discount is required'] 
  },
  size: { 
    type: String, 
    trim: true 
  },
  fitType: { 
    type: String, 
    trim: true 
  },
  clothColor: { 
    type: String, 
    trim: true 
  },
  material: { 
    type: String, 
    trim: true 
  },
  sleeveLength: { 
    type: String, 
    trim: true 
  },
  neckStyle: { 
    type: String, 
    trim: true 
  },
  patternPrint: { 
    type: String, 
    trim: true 
  },
  customAddress: { 
    type: Boolean, 
    required: [true, 'Custom address is required'],
    default: false
  },
  propertyType: { 
    type: String, 
    trim: true 
  },
  squareFootArea: { 
    type: String, 
    trim: true 
  },
  noOfBedrooms: { 
    type: Number 
  },
  noOfBathrooms: { 
    type: Number 
  },
  furnishingStatus: { 
    type: String, 
    trim: true 
  },
  ownershipType: { 
    type: String, 
    trim: true 
  },
  amenities: { 
    type: [{ type: String }], 
    trim: true 
  },
  propertyCondition: { 
    type: String, 
    trim: true 
  },
  bodyType: { 
    type: String, 
    trim: true 
  },
  carModel: { 
    type: String, 
    trim: true 
  },
  carYear: { 
    type: String, 
    trim: true 
  },
  transmission: { 
    type: String, 
    trim: true 
  },
  fuelType: { 
    type: String, 
    trim: true 
  },
  mileage: { 
    type: String, 
    trim: true 
  },
  carColor: { 
    type: String, 
    trim: true 
  },
  driveTrain: { 
    type: String, 
    trim: true 
  },
  vendorName: { 
    type: String, 
    trim: true,
    required: [false, 'Vendor name is optional']
  },
  vendorPhone: { 
    type: String, 
    trim: true ,
    required: [false, 'Vendor phone is optional']
  },
  driver_type: { 
    type: String, 
    trim: true,
    required: [false, 'Driver type is optional']
  }
}, { 
  timestamps: true,
  versionKey: false // Disable the __v field
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;