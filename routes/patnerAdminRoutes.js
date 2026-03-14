import express from "express";
import { getChatList, getMessages } from "../controller/patnerAdminController.js";
const patnerAdminRouter = express.Router();


patnerAdminRouter.get("/chat/list/dashboard/:userId", getChatList)
patnerAdminRouter.get("/chat/messages/dashboard/:userId", getMessages)



export default patnerAdminRouter;

