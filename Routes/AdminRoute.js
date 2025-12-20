const { Router } = require('express');
const { adminLogin } = require('../Controllers/AdminAuthController.js');
const { listUsers, editUser, listUsersWithProducts, getUserCounts, getUserById, deleteUser, listUserProducts } = require('../Controllers/AdminUserController.js');
const { listProducts, deleteProduct } = require('../Controllers/AdminProductController.js');
const { listCategories, getCategoryById, createCategory, editCategory, deleteCategory, restoreCategory } = require('../Controllers/AdminCategoryController.js');
const verifyAdminToken = require('../Helper/VerifyAdminToken.js');

const router = Router();

router.post('/login', adminLogin.validator, adminLogin.controller);

// User Management Routes
router.get('/users', verifyAdminToken, listUsers.validator, listUsers.controller);
router.get('/users/:userId', verifyAdminToken, getUserById.validator, getUserById.controller);
router.patch('/users/:userId', verifyAdminToken, editUser.validator, editUser.controller);
router.delete('/users/:userId', verifyAdminToken, deleteUser.validator, deleteUser.controller);
router.get('/users/:userId/products', verifyAdminToken, listUserProducts.validator, listUserProducts.controller);
router.get('/users-with-products', verifyAdminToken, listUsersWithProducts.validator, listUsersWithProducts.controller);
router.get('/total-counts', verifyAdminToken, getUserCounts.validator, getUserCounts.controller);

// Product Management Routes
router.get('/products', verifyAdminToken, listProducts.validator, listProducts.controller);
router.delete('/products/:productId', verifyAdminToken, deleteProduct.validator, deleteProduct.controller);

// Category Management Routes (Admin Only)
router.get('/categories', verifyAdminToken, listCategories.validator, listCategories.controller);
router.get('/categories/:categoryId', verifyAdminToken, getCategoryById.validator, getCategoryById.controller);
router.post('/categories', verifyAdminToken, createCategory.validator, createCategory.controller);
router.patch('/categories/:categoryId', verifyAdminToken, editCategory.validator, editCategory.controller);
router.delete('/categories/:categoryId', verifyAdminToken, deleteCategory.validator, deleteCategory.controller);
router.patch('/categories/:categoryId/restore', verifyAdminToken, restoreCategory.validator, restoreCategory.controller);

module.exports = router;


