const { Router } = require('express');
const { adminLogin } = require('../Controllers/AdminAuthController.js');
const { listUsers, editUser, listUsersWithProducts, getUserCounts, getUserById, deleteUser, listUserProducts } = require('../Controllers/AdminUserController.js');
const { listProducts, deleteProduct } = require('../Controllers/AdminProductController.js');
const verifyAdminToken = require('../Helper/VerifyAdminToken.js');

const router = Router();

router.post('/login', adminLogin.validator, adminLogin.controller);
router.get('/users', verifyAdminToken, listUsers.validator, listUsers.controller);
router.get('/users/:userId', verifyAdminToken, getUserById.validator, getUserById.controller);
router.patch('/users/:userId', verifyAdminToken, editUser.validator, editUser.controller);
router.delete('/users/:userId', verifyAdminToken, deleteUser.validator, deleteUser.controller);
router.get('/products', verifyAdminToken, listProducts.validator, listProducts.controller);
router.get('/users/:userId/products', verifyAdminToken, listUserProducts.validator, listUserProducts.controller);
router.delete('/products/:productId', verifyAdminToken, deleteProduct.validator, deleteProduct.controller);
router.get('/users-with-products', verifyAdminToken, listUsersWithProducts.validator, listUsersWithProducts.controller);
router.get('/users/counts', verifyAdminToken, getUserCounts.validator, getUserCounts.controller);

module.exports = router;


