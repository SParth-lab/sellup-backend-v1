const { Router } = require('express');
const { addReview, editReview, deleteReview, getReviews } = require('../Controllers/ReviewController.js');
const verifyToken  = require('../Helper/VerifyToken.js');

const router = Router();


router.post("/add", verifyToken, addReview.validator, addReview.controller);
router.put("/edit", verifyToken, editReview.validator, editReview.controller);
router.delete("/delete", verifyToken, deleteReview.validator, deleteReview.controller);
router.get("/getByProductId", getReviews.validator, getReviews.controller);

 



module.exports = router;