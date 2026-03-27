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

export const getPartnerAllUsers = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }
        const partnerUsers = await chatList.find({ partnerId: userId }).select("-password");
        res.status(200).json({
            success: true,
            data: partnerUsers
        });
    } catch (error) {
        console.error("Error fetching partner users:", error);
        return null;
    }

}

export const getPartnerAllConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const totalChats = await chatHistory.countDocuments({ adminId: userId });

        res.status(200).json({
            success: true,
            totalChats
        });

    } catch (error) {
        console.error("Error fetching partner users:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }

}

export const handlePartnerAnaytics = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const today = new Date();
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 6);

        const chatData = await chatHistory.aggregate([
            {
                $match: {
                    adminId: new mongoose.Types.ObjectId(partnerId),
                    createdAt: { $gte: last7Days },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    chats: { $sum: 1 },
                },
            },
        ]);

        const userData = await chatList.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    users: { $sum: 1 }, // each doc = 1 user
                },
            },
        ]);

        const chatMap = {};
        chatData.forEach((item) => {
            chatMap[item._id] = item.chats;
        });

        const userMap = {};
        userData.forEach((item) => {
            userMap[item._id] = item.users;
        });

        const result = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));

            const key = d.toISOString().split("T")[0];

            result.push({
                date: key,
                chats: chatMap[key] || 0,
                users: userMap[key] || 0,
            });
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const conversationsDepthController = async (req, res) => {
    try {
        const { partnerId } = req.params;
        console.log("Received partnerId:", partnerId); // Debug log
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner ID."
            });
        }
        const conversations = await chatHistory.find({ adminId: partnerId });
        let short = 0;
        let medium = 0;
        let long = 0;
        let totalMessages = 0;

        conversations.forEach((chat) => {
            const count = chat.message.length;

            totalMessages += count;

            if (count <= 3) short++;
            else if (count <= 10) medium++;
            else long++;
        });

        const avg = totalMessages / conversations.length;

        res.json({
            short,
            medium,
            long,
            avg: Number(avg.toFixed(1)),
            growth: 10 // optional (manual or calculated)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }

}

export const partnerActivityAnalytics = async (req, res) => {
    try {
        const { partnerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner ID."
            });
        }
        const days = 7;
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
            const start = new Date();
            start.setDate(start.getDate() - i);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            const count = await User.countDocuments({
                lastActive: { $gte: start, $lte: end }
            });

            const dayName = start.toLocaleDateString("en-US", {
                weekday: "short"
            });

            result.push({
                day: dayName,
                users: count
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

export const partnerTopUserQuestionsController = async (req, res) => {
    try {
        const { partnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner ID."
            });
        }

        const result = await chatHistory.aggregate([

            // ✅ filter by partnerId + sender
            {
                $match: {
                    adminId: new mongoose.Types.ObjectId(partnerId),
                    sender: "user"
                }
            },

            // ✅ normalize text (lowercase)
            {
                $project: {
                    message: { $toLower: "$message" }
                }
            },

            // ✅ group by message
            {
                $group: {
                    _id: "$message",
                    count: { $sum: 1 }
                }
            },

            // ✅ sort highest first
            {
                $sort: { count: -1 }
            },

            // ✅ top 3
            {
                $limit: 3
            }

        ]);

        const formatted = result.map(item => ({
            label: item._id,
            value: item.count
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};