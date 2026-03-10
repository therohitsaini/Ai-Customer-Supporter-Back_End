import mongoose from "mongoose";
import pdf from "pdf-parse";
import Knowledge from "../modal/knowledgeSchema.js";
import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";
import ChatList from "../modal/chatList.js";

dotenv.config();



export const uploadPDF = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No PDF uploaded" });
        }

        console.log("Uploaded file info:", req.file);

        const buffer = req.file.buffer;
        const data = await pdf(buffer);
        const extractedText = data.text;

        await Knowledge.create({
            userId,
            fileName: req.file.originalname,
            content: extractedText
        });

        res.status(200).json({
            success: true,
            message: "PDF uploaded and processed successfully"
        });

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
                await ChatList.create(
                    {
                        partnerId: userId,
                        email: user,
                        password: "defaultpassword",
                        lastMessage: question
                    }
                );
                return res.status(200).json({ answer: "Question received and user added to chat list." });
            } else {
                userInfo_.lastMessage = question;
                await userInfo_.save();
            }
        }
        const docs = await Knowledge.find({ userId });
        if (!docs.length) {
            return res.status(404).json({ answer: "No PDF content found for this user." });
        }

        const combinedText = docs.map(d => d.content).join("\n\n");
        const contextText = combinedText.slice(0, 3000);
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
        console.log("AI Response:", response.data);
        res.json({
            reply: response.data || response.data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ answer: "Error generating answer." });
    }
};