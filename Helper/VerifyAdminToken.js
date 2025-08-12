const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
const Admin = require('../Models/Admin.js');

dotenv.config();

const VerifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ error: 'Unauthorized Admin' });
    }
    const token = authHeader.split(' ')[1];
    const verified = JWT.verify(token, process.env.JWT_SEC_KEY);

    const admin = await Admin.findOne({ _id: verified._id, isActive: true, isDeleted: false }).select({
      email: 1,
      name: 1,
      isActive: 1,
      isDeleted: 1,
      role: 1
    }).lean();

    if (!admin) {
      return res.status(401).send({ error: 'Admin Not Found' });
    }

    req.token = token;
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).send({ error: 'Unauthorized Admin' });
  }
};

module.exports = VerifyAdminToken;


