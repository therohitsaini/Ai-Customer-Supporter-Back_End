import express from "express";
import { uploadPDF, askQuestion } from "../controller/faqController.js";
import upload from "../middleware/uploadMiddleware.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
const fqaRouter = express.Router();

fqaRouter.post("/upload/:userId",verifyTokenMiddleware, upload.single("pdf"), uploadPDF);
fqaRouter.post("/ask/:userId", askQuestion);

export default fqaRouter;