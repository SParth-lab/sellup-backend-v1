const { Router } = require('express');
const { addReview, editReview, deleteReview } = require('../Controllers/ReviewController.js');
const verifyToken  = require('../Helper/VerifyToken.js');

const router = Router();


router.post("/add", verifyToken, addReview.validator, addReview.controller);
router.put("/edit", verifyToken, editReview.validator, editReview.controller);
router.delete("/delete", verifyToken, deleteReview.validator, deleteReview.controller);

 



module.exports = router;