import express from "express";
const verifyRouter = express.Router();
import { verifyToken } from "../controller/authController.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";


verifyRouter.post("/verify/auth/user", verifyTokenMiddleware, verifyToken);

export default verifyRouter;