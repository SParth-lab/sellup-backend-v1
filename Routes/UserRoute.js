const { Router } = require('express');
const { createUser, login, changePassword, editUser, forgotPassword, setUserPreference } = require('../Controllers/UserController.js');
const verifyToken = require('../Helper/VerifyToken.js');

const router = Router();


router.post("/signup", createUser.validator, createUser.controller);
 
router.post("/login", login.validator, login.controller);

router.post("/change-password", verifyToken, changePassword.validator, changePassword.controller);

router.post("/edit-user", verifyToken, editUser.controller);

router.post("/forgot-password", forgotPassword.validator, forgotPassword.controller);

router.post("/set-user-preference", verifyToken, setUserPreference.validator, setUserPreference.controller);

module.exports = router;