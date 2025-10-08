const Product = require('../Models/Product.js');

const listProducts = {
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

      const criteria = { isDelete: false };
      const qIsDelete = parseBoolean(req.query.isDelete);
      if (qIsDelete !== undefined) criteria.isDelete = qIsDelete;

      // Optional filters
      const stringFilters = ['category', 'subCategory', 'rentType', 'vendorName', 'vendorPhone', 'driver_type'];
      stringFilters.forEach((key) => {
        const value = req.query[key];
        if (value) criteria[key] = { $regex: value, $options: 'i' };
      });

      // Location filters
      ['city', 'state', 'area', 'country', 'zipCode'].forEach((key) => {
        const value = req.query[key];
        if (value) criteria[`location.${key}`] = { $regex: value, $options: 'i' };
      });

      // By user
      if (req.query.userId) criteria.userId = req.query.userId;

      // Price range
      const priceMin = req.query.priceMin ? Number(req.query.priceMin) : undefined;
      const priceMax = req.query.priceMax ? Number(req.query.priceMax) : undefined;
      if (priceMin !== undefined || priceMax !== undefined) {
        criteria.price = {};
        if (priceMin !== undefined) criteria.price.$gte = priceMin;
        if (priceMax !== undefined) criteria.price.$lte = priceMax;
      }

      if (search) {
        criteria.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

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

const deleteProduct = {
  validator: async (req, res, next) => {
    const { productId } = req.params;
    if (!productId) return res.status(400).send({ error: 'productId is required' });
    next();
  },
  controller: async (req, res) => {
    try {
      const { productId } = req.params;
      const hard = String(req.query.hard || '').toLowerCase() === 'true';

      if (hard) {
        const deleted = await Product.findByIdAndDelete(productId).lean();
        if (!deleted) return res.status(404).send({ error: 'Product not found' });
        return res.status(200).send({ message: 'Product permanently deleted' });
      }

      const updated = await Product.findByIdAndUpdate(productId, { $set: { isDelete: true } }, { new: true }).lean();
      if (!updated) return res.status(404).send({ error: 'Product not found' });
      return res.status(200).send({ message: 'Product soft deleted', product: updated });
    } catch (error) {
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

module.exports = { listProducts, deleteProduct };


