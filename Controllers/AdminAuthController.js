const Admin = require('../Models/Admin.js');
const generateAdminToken = require('../Helper/generateAdminToken.js');

const adminLogin = {
  validator: async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ error: 'Please provide email and password' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { email, password } = req.body;
      const criteria = { email, isActive: true, isDeleted: false };
      const admin = await Admin.findOne(criteria).lean();

      if (!admin) {
        return res.status(401).send({ error: 'Admin not found or inactive' });
      }

      const passwordCompareResult = await Admin.comparePassword(password, admin.password);
      const { err } = passwordCompareResult || {};
      if (err) {
        return res.status(400).send({ error: 'Invalid password' });
      }

      const token = await generateAdminToken(admin);
      return res.status(200).json({ success: true, token, adminInfo: admin });
    } catch (e) {
      console.log('adminLogin controller error:', e);
      return res.status(400).send({ error: 'Login Failed Internal Server Error' });
    }
  }
};

module.exports = { adminLogin };


