import express from "express";
import { getChatList, getMessages, getPartnerAllConversations, getPartnerAllUsers, getPartnerDetails, handlePartnerAnaytics } from "../controller/patnerAdminController.js";
const partnerAdminRouter = express.Router();


partnerAdminRouter.get("/chat/list/dashboard/:userId", getChatList)
partnerAdminRouter.get("/chat/messages/dashboard/:userId", getMessages)
partnerAdminRouter.get("/partner/details/dashboard/:userId", getPartnerDetails)
partnerAdminRouter.get("/partner/all/users/dashboard/:userId", getPartnerAllUsers)
partnerAdminRouter.get("/partner/all/conversations/dashboard/:userId", getPartnerAllConversations)
partnerAdminRouter.get("/partner/analytics/dashboard/:partnerId", handlePartnerAnaytics)   

    
export default partnerAdminRouter;

