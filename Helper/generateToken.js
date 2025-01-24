import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Session from '../Models/Session.js';

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
      expiresIn: '30d' // Token expires in 30 days
    };
    return JWT.sign(payload, process.env.JWT_SEC_KEY, options);
  } catch (error) {
    // Log the error and rethrow it
    console.error('Error generating token:', error);
    throw error;
  }
};

export default generateToken;