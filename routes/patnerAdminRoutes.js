import express from "express";
import { getChatList, getMessages, getPartnerDetails } from "../controller/patnerAdminController.js";
const patnerAdminRouter = express.Router();


patnerAdminRouter.get("/chat/list/dashboard/:userId", getChatList)
patnerAdminRouter.get("/chat/messages/dashboard/:userId", getMessages)
patnerAdminRouter.get("/partner/details/dashboard/:userId", getPartnerDetails)



export default patnerAdminRouter;

