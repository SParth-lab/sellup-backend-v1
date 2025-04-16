const { Router } = require('express');
const { createProduct, getProducts, editProduct, deleteProduct } = require('../Controllers/ProductController.js');
const verifyToken  = require('../Helper/VerifyToken.js');

const router = Router();


router.post("/add", verifyToken, createProduct.validator, createProduct.controller);
router.get("/get-user-products", getProducts.validator, getProducts.controller);
router.put("/edit", verifyToken, editProduct.validator, editProduct.controller);
router.delete("/delete", verifyToken, deleteProduct.validator, deleteProduct.controller);

 



module.exports = router;