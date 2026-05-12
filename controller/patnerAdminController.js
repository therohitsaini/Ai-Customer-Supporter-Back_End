import mongoose from "mongoose";
import { chatHistory } from "../modal/chatHistroy.js";
import chatList from "../modal/chatList.js";
import { userInfo } from "../modal/userSchema.js";
import { Company } from "../modal/onbordingSchema.js";
import client from "../utiles/rediesdb.js";

const ANALYTICS_TTL = 300;    // 5 minutes
const PROFILE_TTL = 3600;     // 1 hour

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

        const cacheKey = `analytics:${partnerId}`;
        const cached = await client.get(cacheKey);
        if (cached) return res.status(200).json({ success: true, data: JSON.parse(cached) });

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

        await client.setEx(cacheKey, ANALYTICS_TTL, JSON.stringify(result));

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
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID." });
        }

        const cacheKey = `conv_depth:${partnerId}`;
        const cached = await client.get(cacheKey);
        if (cached) return res.json(JSON.parse(cached));

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
        const result = { short, medium, long, avg: Number(avg.toFixed(1)), growth: 10 };

        await client.setEx(cacheKey, ANALYTICS_TTL, JSON.stringify(result));

        res.json(result);
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
            return res.status(400).json({ success: false, message: "Invalid partner ID." });
        }

        const cacheKey = `top_questions:${partnerId}`;
        const cached = await client.get(cacheKey);
        if (cached) return res.status(200).json({ success: true, data: JSON.parse(cached) });

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

        await client.setEx(cacheKey, ANALYTICS_TTL, JSON.stringify(formatted));

        return res.status(200).json({ success: true, data: formatted });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const fetchPartnerDetails = async (req, res) => {
    try {
        const { partnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }

        const cacheKey = `partner_profile:${partnerId}`;
        const cached = await client.get(cacheKey);
        if (cached) return res.status(200).json({ success: true, message: "Partner details fetched successfully", data: JSON.parse(cached) });

        const partnerDetails = await userInfo.findById(partnerId).select("-password").lean();
        console.log("partnerDetails", partnerDetails)

        if (!partnerDetails) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }
        console.log("partnerDetails", partnerDetails)
        const partnerCompanyDetails = await Company.findOne({ userId: partnerId }).lean();
        const data = { ...partnerDetails, companyDetails: partnerCompanyDetails || null };

        await client.setEx(cacheKey, PROFILE_TTL, JSON.stringify(data));

        return res.status(200).json({ success: true, message: "Partner details fetched successfully", data });

    } catch (error) {
        console.error("Error fetching partner details:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// _-------------------------- update profile ------------------------------------//

export const updateProfile = async (req, res) => {
    try {
        const { partnerId } = req.params;
        console.log("Update profile request for partnerId:", req.headers.authorization || "No auth header");
        const { name, email, companyName, website, contact } = req.body;
        console.log("Update profile request:", { partnerId, name, email, companyName, website, contact });
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }
        const partner = await userInfo.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }
        if (name) partner.name = name;
        if (email) partner.email = email;
        await partner.save();
        let company = await Company.findOne({ userId: partnerId });
        if (!company) {
            company = new Company({ userId: partnerId, companyName, website, contact });
        } else {
            if (companyName) company.companyName = companyName;
            if (website) company.website = website;
            if (contact) company.contact = contact;
        }
        await company.save();

        // Invalidate cache
        const cacheKey = `partner_profile:${partnerId}`;
        await client.del(cacheKey);
        const updatedDetails = { ...partner.toObject(), companyDetails: company.toObject() };
        await client.setEx(cacheKey, PROFILE_TTL, JSON.stringify(updatedDetails));
        const updatedSettings = { ...updatedDetails, companyDetails: company.toObject() };

        await client.setEx(cacheKey, PROFILE_TTL, JSON.stringify(updatedSettings));

        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedSettings });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
