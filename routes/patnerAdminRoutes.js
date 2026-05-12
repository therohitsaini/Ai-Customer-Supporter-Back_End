import express from "express";
import { conversationsDepthController, fetchPartnerDetails, getChatList, getMessages, getPartnerAllConversations, getPartnerAllUsers, getPartnerDetails, handlePartnerAnaytics, partnerTopUserQuestionsController ,updateProfile} from "../controller/patnerAdminController.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
const partnerAdminRouter = express.Router();


partnerAdminRouter.get("/chat/list/dashboard/:userId",verifyTokenMiddleware,  getChatList)
partnerAdminRouter.get("/chat/messages/dashboard/:userId", getMessages)
partnerAdminRouter.get("/partner/details/dashboard/:userId", getPartnerDetails)
partnerAdminRouter.get("/partner/all/users/dashboard/:userId", getPartnerAllUsers)
partnerAdminRouter.get("/partner/all/conversations/dashboard/:userId", getPartnerAllConversations)
partnerAdminRouter.get("/partner/analytics/dashboard/:partnerId", handlePartnerAnaytics)   
partnerAdminRouter.get("/partner/conversations/depth/dashboard/:partnerId", conversationsDepthController)
partnerAdminRouter.get("/partner/top/user/questions/dashboard/:partnerId", partnerTopUserQuestionsController)
partnerAdminRouter.get("/partner/profile/details/dashboard/:partnerId", fetchPartnerDetails)
partnerAdminRouter.put("/partner/profile/update/dashboard/:partnerId",verifyTokenMiddleware, updateProfile)


    
export default partnerAdminRouter;

