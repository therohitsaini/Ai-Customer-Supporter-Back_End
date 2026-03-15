import mongoose from "mongoose";
import { chatHistory } from "../modal/chatHistroy.js";
import chatList from "../modal/chatList.js";
import { userInfo } from "../modal/userSchema.js";

export const getChatList = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }
        const chatLists = await chatList.find({ partnerId: userId }).sort({ updatedAt: -1 });
        res.status(200).json({
            success: true,
            data: chatLists
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ answer: "Server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const chatLists = await chatHistory.find({ visitorId: userId });
        res.status(200).json({
            success: true,
            data: chatLists
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ answer: "Server error" });
    }
}

export const getPartnerDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }
        const partnerDetails = await userInfo.findById(userId).select("-password");
        if (!partnerDetails) {
            return res.status(404).json({
                success: false,
                message: "Partner not found."
            });
        }
        res.status(200).json({
            success: true,
            data: partnerDetails
        });

    } catch (error) {
        console.error("Error fetching partner details:", error);
        return null;
    }
}