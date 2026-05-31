import mongoose from "mongoose";
import pdf from "pdf-parse";
import Knowledge from "../modal/knowledgeSchema.js";
import axios from "axios";
import dotenv from "dotenv";
import ChatList from "../modal/chatList.js";
import { chatHistory } from "../modal/chatHistroy.js";
import { getIO, getUserSockets } from "../src/socket/socketHandler.js";
import client from "../utiles/rediesdb.js";

dotenv.config();

const KNOWLEDGE_CACHE_TTL = 7200; // 2 hours

export const uploadPDF = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No PDF uploaded" });
        }

        const buffer = req.file.buffer;
        const data = await pdf(buffer);
        const extractedText = data.text;

        await Knowledge.create({
            userId,
            fileName: req.file.originalname,
            content: extractedText
        });

        // Invalidate knowledge cache for this user
        await client.del(`knowledge:${userId}`);

        res.status(200).json({ success: true, message: "PDF uploaded and processed successfully" });
    } catch (error) {
        console.error("Upload PDF error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const askQuestion = async (req, res) => {
    try {
        const { userId } = req.params;
        const { question, user } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ answer: "Invalid user ID." });
        }
        if (!question) {
            return res.status(400).json({ answer: "Question is required." });
        }

        if (user) {
            const userInfo_ = await ChatList.findOne({ email: user });
            if (!userInfo_) {
                await ChatList.create({ partnerId: userId, email: user, password: "defaultpassword", lastMessage: question });
            } else {
                userInfo_.lastMessage = question;
                userInfo_.lastActive = Date.now();
                await userInfo_.save();
            }
        }
        const userInfoFind = await ChatList.findOne({ email: user });

        await chatHistory.create({
            adminId: userId,
            sender: "user",
            message: question,
            visitorId: userInfoFind._id.toString(),
            seenBy: false
        });
        const io = getIO();
        const sockets = getUserSockets(userId);
        if (sockets && sockets.size > 0 && question) {
            const message = { sender: "user", message: question };
            console.log(`Emitting new_notification to user ${userId} on sockets:`, Array.from(sockets));
            sockets.forEach((socketId) => {
                io.to(socketId).emit("new_notification", message);
            });
        }
        // Try cached knowledge base
        let contextText;
        const cachedKnowledge = await client.get(`knowledge:${userId}`);
        if (cachedKnowledge) {
            contextText = cachedKnowledge;
        } else {
            const docs = await Knowledge.find({ userId });
            if (!docs.length) {
                return res.status(404).json({ answer: "No PDF content found for this user." });
            }
            const combinedText = docs.map(d => d.content).join("\n\n");
            contextText = combinedText.slice(0, 3000);
            await client.setEx(`knowledge:${userId}`, KNOWLEDGE_CACHE_TTL, contextText);
        }

        const prompt = `
                You are an AI assistant. Answer the question based on the following PDF content:
                PDF Content:
                ${contextText}
                Question: ${question}
                Answer:
        `;

        const response = await axios.post(
            "https://apifreellm.com/api/v1/chat",
            { message: prompt },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.FREELLM_API_KEY}`
                }
            }
        );



        await chatHistory.create({
            adminId: userId,
            sender: "bot",
            message: response.data.response,
            visitorId: userInfoFind._id.toString(),
            seenBy: false
        });


        const message = { sender: "bot", message: response.data.response };

        if (sockets && sockets.size > 0) {
            console.log(`Emitting new_notification to user ${userId} on sockets:`, Array.from(sockets));
            sockets.forEach((socketId) => {
                io.to(socketId).emit("new_notification", message);
            });
        }

        res.json({ reply: response.data || response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ answer: "Error generating answer." });
    }
};
