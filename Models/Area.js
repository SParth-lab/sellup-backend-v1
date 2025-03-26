const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    area: {
        type: String,
        required: [false, 'Area is required'],
        trim: true
    },
    city: {
        type: String,
        required: [false, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [false, 'State is required'],
        trim: true
    },
    country: {
        type: String,
        required: [false, 'Country is required'],
        trim: true,
        default: "India"
    },
    pincode: {
        type: String,
        required: [false, 'pincode is required'],
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false // Disable the __v field
});

const Area = mongoose.model("Area", areaSchema);
module.exports = Area;