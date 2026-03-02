import express from 'express';
import { handleChatRequest } from '../controller/apiFreellmController.js';
import { userLoginInfo, userResgisterInfo } from '../authController/userLoginInfo.js';
const userInfoRoute = express.Router();

userInfoRoute.post("/register-info", userResgisterInfo);
userInfoRoute.post("/login-info", userLoginInfo);

export default userInfoRoute;