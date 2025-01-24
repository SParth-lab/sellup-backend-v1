import mongoose from 'mongoose';


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { 
  timestamps: true,
  versionKey: false // Disable the __v field
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
