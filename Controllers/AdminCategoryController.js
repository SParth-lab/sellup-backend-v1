const Category = require('../Models/Category.js');

// List all categories (with pagination, can include deleted)
const listCategories = {
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

      const criteria = {};
      
      // Filter by isDelete status (default: show non-deleted)
      const qIsDelete = parseBoolean(req.query.isDelete);
      if (qIsDelete !== undefined) {
        criteria.isDelete = qIsDelete;
      } else {
        criteria.isDelete = false;
      }

      // Filter by isOtherCategory
      const qIsOtherCategory = parseBoolean(req.query.isOtherCategory);
      if (qIsOtherCategory !== undefined) {
        criteria.isOtherCategory = qIsOtherCategory;
      }

      // Search by name or description
      if (search) {
        criteria.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const [categories, total] = await Promise.all([
        Category.find(criteria).skip(skip).limit(limit).sort({ sortOrder: 1, createdAt: -1 }).lean(),
        Category.countDocuments(criteria)
      ]);

      return res.status(200).send({ 
        categories, 
        page, 
        limit, 
        total, 
        totalPages: Math.ceil(total / limit) 
      });
    } catch (error) {
      console.log("🚀 ~ listCategories ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

// Get category by ID
const getCategoryById = {
  validator: async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).send({ error: 'categoryId is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const category = await Category.findById(categoryId).lean();
      
      if (!category) {
        return res.status(404).send({ error: 'Category not found' });
      }

      return res.status(200).send({ category });
    } catch (error) {
      console.log("🚀 ~ getCategoryById ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

// Create new category
const createCategory = {
  validator: async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ error: 'Category name is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { name, description, colorCode, image, subCategories, isOtherCategory, sortOrder } = req.body;

      // Check if category with same name already exists
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        isDelete: false 
      });
      
      if (existingCategory) {
        return res.status(400).send({ error: 'Category with this name already exists' });
      }

      const categoryData = {
        name: name.trim(),
        description: description || '',
        colorCode: colorCode || '',
        image: image || '',
        isOtherCategory: isOtherCategory || false,
        sortOrder: sortOrder || 0
      };

      if (subCategories && Array.isArray(subCategories)) {
        categoryData.subCategories = subCategories.map(subCategory => subCategory.trim().toUpperCase());
      }

      const category = await Category.create(categoryData);

      return res.status(201).send({ 
        message: 'Category created successfully', 
        category 
      });
    } catch (error) {
      console.log("🚀 ~ createCategory ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

// Edit/Update category
const editCategory = {
  validator: async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).send({ error: 'categoryId is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name, description, colorCode, image, subCategories, isOtherCategory, sortOrder } = req.body;

      // Check if category exists
      const existingCategory = await Category.findById(categoryId);
      if (!existingCategory) {
        return res.status(404).send({ error: 'Category not found' });
      }

      // If name is being changed, check for duplicates
      if (name && name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
        const duplicateCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
          isDelete: false,
          _id: { $ne: categoryId }
        });
        
        if (duplicateCategory) {
          return res.status(400).send({ error: 'Category with this name already exists' });
        }
      }

      const updateData = {};

      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description;
      if (colorCode !== undefined) updateData.colorCode = colorCode;
      if (image !== undefined) updateData.image = image;
      if (isOtherCategory !== undefined) updateData.isOtherCategory = isOtherCategory;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      
      if (subCategories !== undefined && Array.isArray(subCategories)) {
        updateData.subCategories = subCategories.map(subCategory => subCategory.trim().toUpperCase());
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { $set: updateData },
        { new: true }
      ).lean();

      return res.status(200).send({ 
        message: 'Category updated successfully', 
        category: updatedCategory 
      });
    } catch (error) {
      console.log("🚀 ~ editCategory ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

// Delete category (soft delete or hard delete)
const deleteCategory = {
  validator: async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).send({ error: 'categoryId is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const hard = String(req.query.hard || '').toLowerCase() === 'true';

      if (hard) {
        const deleted = await Category.findByIdAndDelete(categoryId).lean();
        if (!deleted) {
          return res.status(404).send({ error: 'Category not found' });
        }
        return res.status(200).send({ message: 'Category permanently deleted' });
      }

      const updated = await Category.findByIdAndUpdate(
        categoryId,
        { $set: { isDelete: true } },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).send({ error: 'Category not found' });
      }

      return res.status(200).send({ 
        message: 'Category soft deleted', 
        category: updated 
      });
    } catch (error) {
      console.log("🚀 ~ deleteCategory ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

// Restore soft-deleted category
const restoreCategory = {
  validator: async (req, res, next) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).send({ error: 'categoryId is required' });
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const { categoryId } = req.params;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).send({ error: 'Category not found' });
      }

      if (!category.isDelete) {
        return res.status(400).send({ error: 'Category is not deleted' });
      }

      const restoredCategory = await Category.findByIdAndUpdate(
        categoryId,
        { $set: { isDelete: false } },
        { new: true }
      ).lean();

      return res.status(200).send({ 
        message: 'Category restored successfully', 
        category: restoredCategory 
      });
    } catch (error) {
      console.log("🚀 ~ restoreCategory ~ error:", error);
      return res.status(400).send({ error: error.message || 'Internal server error' });
    }
  }
};

module.exports = { 
  listCategories, 
  getCategoryById, 
  createCategory, 
  editCategory, 
  deleteCategory,
  restoreCategory 
};

