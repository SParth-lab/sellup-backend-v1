const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true 
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        trim: true, 
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phoneNumber: { 
        type: String, 
        required: [false, 'Phone number is required'], 
        unique: true, 
        trim: true,
        match: [/^\d{10}$/, 'Please fill a valid phone number'] 
    },
    fullAddress: { 
        type: Object, 
        required: [false, 'Full address is required']
    },
    address: { 
        type: String, 
        required: [false, 'Address is required'], 
        trim: true 
    },
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
        trim: true ,
        default: "India"
    },
    zipCode: { 
        type: String, 
        required: [false, 'Zip code is required'], 
        trim: true 
    },
    latitude: { 
        type: Number, 
        required: [false, 'Latitude is required'], 
        trim: true 
    },
    longitude: { 
        type: Number, 
        required: [false, 'Longitude is required'], 
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'] 
    },
    avatar: { 
        type: String, 
        default: "" 
    },
    role: { 
        type: String, 
        default: 'user', 
        enum: ['user', 'admin'] 
    },
    isPhoneVerified: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
    productLimit: {
        type: Number,
        default: 10
    }, 
    productCount: {
        type: Number,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isChatEnabled: {
        type: Boolean,
        default: true
    },
    isCallEnabled: {
        type: Boolean,
        default: true
    },
    isAdsEnable: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Method to generate password hash
userSchema.statics.generatePasswordHash = async function(password) {
    try {
        const hash = await bcrypt.hash(password, 10);
        return { hash };
    } catch (err) {
        throw err;
    }
};

// Method to compare password
userSchema.statics.comparePassword = async function(candidatePassword, hashedPassword) {
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

const User = mongoose.model("User", userSchema);
module.exports = User;