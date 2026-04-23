import express from 'express';
import { userLoginInfo, userResgisterInfo, userLogout } from '../authController/userLoginInfo.js';
import { verifyTokenMiddleware } from '../middleware/authMiddleware.js';

const userInfoRoute = express.Router();

userInfoRoute.post("/register-info", userResgisterInfo);
userInfoRoute.post("/login-info", userLoginInfo);
userInfoRoute.post("/logout", verifyTokenMiddleware, userLogout);

export default userInfoRoute;
