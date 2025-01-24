import { Router } from 'express';
import { createUser, login, changePassword, editUser } from '../Controllers/UserController.js';
import verifyToken from '../Helper/VerifyToken.js';
const router = Router();


router.post("/signup", createUser.validator, createUser.controller);

 
router.post("/login", login.validator, login.controller);

router.post("/change-password", verifyToken, changePassword.validator, changePassword.controller);

router.post("/edit-user", verifyToken, editUser.controller);



export default router;