import { Router } from 'express';
import { createProduct, getProducts, editProduct, deleteProduct } from '../Controllers/ProductController.js';
import verifyToken  from '../Helper/VerifyToken.js';

const router = Router();


router.post("/add", verifyToken, createProduct.validator, createProduct.controller);
router.get("/get-user-products", verifyToken, getProducts.validator, getProducts.controller);
router.put("/edit", verifyToken, editProduct.validator, editProduct.controller);
router.delete("/delete", verifyToken, deleteProduct.validator, deleteProduct.controller);

 



export default router;