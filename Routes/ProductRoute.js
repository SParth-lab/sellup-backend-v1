const { Router } = require('express');
const { createProduct, getProducts, editProduct, deleteProduct, updateRentedDates, deleteRentedDates } = require('../Controllers/ProductController.js');
const verifyToken  = require('../Helper/VerifyToken.js');

const router = Router();


router.post("/add", verifyToken, createProduct.validator, createProduct.controller);
router.get("/get-user-products", getProducts.validator, getProducts.controller);
router.put("/edit", verifyToken, editProduct.validator, editProduct.controller);
router.delete("/delete", verifyToken, deleteProduct.validator, deleteProduct.controller);

// Rented dates routes
router.put("/rented-dates/update", verifyToken, updateRentedDates.validator, updateRentedDates.controller);
router.delete("/rented-dates/delete", verifyToken, deleteRentedDates.validator, deleteRentedDates.controller);

module.exports = router;