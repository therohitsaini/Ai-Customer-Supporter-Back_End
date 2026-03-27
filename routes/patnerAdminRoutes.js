import express from "express";
import { conversationsDepthController, getChatList, getMessages, getPartnerAllConversations, getPartnerAllUsers, getPartnerDetails, handlePartnerAnaytics, partnerTopUserQuestionsController } from "../controller/patnerAdminController.js";
const partnerAdminRouter = express.Router();


partnerAdminRouter.get("/chat/list/dashboard/:userId", getChatList)
partnerAdminRouter.get("/chat/messages/dashboard/:userId", getMessages)
partnerAdminRouter.get("/partner/details/dashboard/:userId", getPartnerDetails)
partnerAdminRouter.get("/partner/all/users/dashboard/:userId", getPartnerAllUsers)
partnerAdminRouter.get("/partner/all/conversations/dashboard/:userId", getPartnerAllConversations)
partnerAdminRouter.get("/partner/analytics/dashboard/:partnerId", handlePartnerAnaytics)   
partnerAdminRouter.get("/partner/conversations/depth/dashboard/:partnerId", conversationsDepthController)
partnerAdminRouter.get("/partner/top/user/questions/dashboard/:partnerId", partnerTopUserQuestionsController)


    
export default partnerAdminRouter;

