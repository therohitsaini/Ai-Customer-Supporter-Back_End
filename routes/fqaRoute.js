import express from "express";
import { uploadPDF, askQuestion } from "../controller/faqController.js";
import upload from "../middleware/uploadMiddleware.js";

const fqaRouter = express.Router();

fqaRouter.post("/upload/:userId", upload.single("pdf"), uploadPDF);
fqaRouter.post("/ask/:userId", askQuestion);

export default fqaRouter;