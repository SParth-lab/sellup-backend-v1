const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    subCategories: [{
        type: String,
    }],
    colorCode: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    isOtherCategory: {
        type: Boolean,
        default: false
    }
}, { 
  timestamps: true,
  versionKey: false // Disable the __v field
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;