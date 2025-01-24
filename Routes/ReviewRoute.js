import { Router } from 'express';
import { addReview, editReview, deleteReview } from '../Controllers/ReviewController.js';
import verifyToken  from '../Helper/VerifyToken.js';

const router = Router();


router.post("/add", verifyToken, addReview.validator, addReview.controller);
router.put("/edit", verifyToken, editReview.validator, editReview.controller);
router.delete("/delete", verifyToken, deleteReview.validator, deleteReview.controller);

 



export default router;