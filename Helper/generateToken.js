const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Session = require('../Models/Session.js');

// Load environment variables from .env file
dotenv.config();


const generateToken = async (user) => {
  try {
    // Ensure the JWT secret is defined
    if (!process.env.JWT_SEC_KEY) {
      throw new Error('JWT_SEC_KEY is not defined in environment variables');
    }
    // Define the payload for the token
    const payload = {
      _id: user._id,
      email: user.email
    };
    // Define the options for the token
    const options = {
      expiresIn: 60 * 60 * 24 * 7  // 7 days in seconds
    };
    return JWT.sign(payload, process.env.JWT_SEC_KEY, options);
  } catch (error) {
    // Log the error and rethrow it
    console.error('Error generating token:', error);
    throw error;
  }
};

module.exports = generateToken;