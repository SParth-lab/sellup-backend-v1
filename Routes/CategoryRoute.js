import { Router } from 'express';
import { createCategory, getCategories } from '../Controllers/CategoryController.js';
import VerifyToken from '../Helper/VerifyToken.js';
const router = Router();


router.post("/create", createCategory.validator, createCategory.controller);

router.get("/get", VerifyToken, getCategories.controller);

export default router;
