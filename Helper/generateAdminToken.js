const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateAdminToken = async (admin) => {
  if (!process.env.JWT_SEC_KEY) {
    throw new Error('JWT_SEC_KEY is not defined');
  }
  const payload = {
    _id: admin._id,
    email: admin.email,
    role: 'admin'
  };
  return JWT.sign(payload, process.env.JWT_SEC_KEY, { expiresIn: '30d' });
};

module.exports = generateAdminToken;


