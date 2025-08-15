const User = require('../Models/User.js');
const Product = require('../Models/Product.js');

const listUsers = {
  validator: async (req, res, next) => {
    next();
  },
  controller: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const search = req.query.search || '';
      const skip = (page - 1) * limit;

      const parseBoolean = (value) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true') return true;
          if (lower === 'false') return false;
        }
        return undefined;
      };

      // Default wall filters
      const criteria = { };

      // Allow overriding via query params only if explicitly provided
      const qIsActive = parseBoolean(req.query.isActive);
      const qIsDeleted = parseBoolean(req.query.isDeleted);
      if (qIsActive !== undefined) criteria.isActive = qIsActive;
      if (qIsDeleted !== undefined) criteria.isDeleted = qIsDeleted;

      // Additional field filters (regex match) if provided
      const stringFilters = ['name', 'lastName', 'email', 'phoneNumber', 'city', 'state', 'area', 'zipCode', 'country'];
      stringFilters.forEach((key) => {
        const value = req.query[key];
        if (value) {
          criteria[key] = { $regex: value, $options: 'i' };
        }
      });
      if (search) {
        criteria.$or = [
          { name: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(criteria).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        User.countDocuments(criteria)
      ]);

      return res.status(200).send({ users, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const editUser = {
  validator: async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send({ error: 'userId is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { userId } = req.params;
      const allowedFields = [
        'name', 'lastName', 'email', 'phoneNumber',
        'address', 'area', 'city', 'state', 'country', 'zipCode',
        'avatar', 'latitude', 'longitude',
        'isActive', 'isDeleted', 'productLimit', 'isChatEnabled', 'isCallEnabled'
      ];

      const updateSet = {};
      allowedFields.forEach((key) => {
        if (req.body[key] !== undefined) {
          updateSet[key] = req.body[key];
        }
      });

      // Build fullAddress if any address pieces present
      const addressKeys = ['address', 'area', 'city', 'state', 'country', 'zipCode'];
      const hasAnyAddress = addressKeys.some((k) => req.body[k] !== undefined);
      if (hasAnyAddress) {
        const fullAddress = {
          address: req.body.address,
          area: req.body.area,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          zipCode: req.body.zipCode,
        };
        Object.keys(fullAddress).forEach((k) => fullAddress[k] === undefined && delete fullAddress[k]);
        updateSet.fullAddress = fullAddress;
      }

      if (Object.keys(updateSet).length === 0) {
        return res.status(400).send({ error: 'No valid fields to update' });
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: updateSet },
        { new: true }
      ).select('-password');

      if (!updated) {
        return res.status(404).send({ error: 'User not found' });
      }

      return res.status(200).send({ message: 'User updated successfully', user: updated });
    } catch (error) {
      // Handle duplicate key errors (email/phone)
      if (error && error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        return res.status(400).send({ error: `${field} already exists` });
      }
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const listUsersWithProducts = {
  validator: async (req, res, next) => {
    next();
  },
  controller: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const search = req.query.search || '';
      const skip = (page - 1) * limit;

      const parseBoolean = (value) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true') return true;
          if (lower === 'false') return false;
        }
        return undefined;
      };

      const criteria = { isActive: true, isDeleted: false };
      const qIsActive = parseBoolean(req.query.isActive);
      const qIsDeleted = parseBoolean(req.query.isDeleted);
      if (qIsActive !== undefined) criteria.isActive = qIsActive;
      if (qIsDeleted !== undefined) criteria.isDeleted = qIsDeleted;

      const stringFilters = ['name', 'lastName', 'email', 'phoneNumber', 'city', 'state', 'area', 'zipCode', 'country'];
      stringFilters.forEach((key) => {
        const value = req.query[key];
        if (value) criteria[key] = { $regex: value, $options: 'i' };
      });

      if (search) {
        criteria.$or = [
          { name: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(criteria)
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        User.countDocuments(criteria)
      ]);

      // Fetch product counts per user in parallel
      // Avoiding $lookup to keep it simple and with existing models
      const userIds = users.map((u) => u._id);
      const counts = await Product.aggregate([
        { $match: { userId: { $in: userIds }, isDelete: false } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);
      const idToCount = counts.reduce((acc, c) => { acc[c._id.toString()] = c.count; return acc; }, {});

      const usersWithCounts = users.map((u) => ({
        ...u,
        productCount: idToCount[u._id.toString()] || 0
      }));

      return res.status(200).send({ users: usersWithCounts, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const getUserCounts = {
  validator: async (req, res, next) => {
    next();
  },
  controller: async (req, res) => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const [totalUsers, newUsersLast7Days, inactiveUsers, deletedUsers] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ isDeleted: true })
      ]);

      return res.status(200).send({
        totalUsers,
        newUsersLast7Days,
        inactiveUsers,
        deletedUsers
      });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const getUserById = {
  validator: async (req, res, next) => {
    if (!req.params.userId) return res.status(400).send({ error: 'userId is required' });
    next();
  },
  controller: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password').lean();
      if (!user) return res.status(404).send({ error: 'User not found' });
      return res.status(200).send({ user });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const deleteUser = {
  validator: async (req, res, next) => {
    if (!req.params.userId) return res.status(400).send({ error: 'userId is required' });
    next();
  },
  controller: async (req, res) => {
    try {
      const { userId } = req.params;
      const hard = String(req.query.hard || '').toLowerCase() === 'true';

      if (hard) {
        const deleted = await User.findByIdAndDelete(userId).lean();
        if (!deleted) return res.status(404).send({ error: 'User not found' });
        return res.status(200).send({ message: 'User permanently deleted' });
      }

      const updated = await User.findByIdAndUpdate(userId, { $set: { isDeleted: true, isActive: false } }, { new: true }).select('-password').lean();
      if (!updated) return res.status(404).send({ error: 'User not found' });
      return res.status(200).send({ message: 'User soft deleted', user: updated });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

const listUserProducts = {
  validator: async (req, res, next) => {
    if (!req.params.userId) return res.status(400).send({ error: 'userId is required' });
    next();
  },
  controller: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;
      const criteria = { userId: req.params.userId, isDelete: false };
      const [products, total] = await Promise.all([
        Product.find(criteria).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        Product.countDocuments(criteria)
      ]);
      return res.status(200).send({ products, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

module.exports = { listUsers, editUser, listUsersWithProducts, getUserCounts, getUserById, deleteUser, listUserProducts };


