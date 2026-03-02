import pdf from "pdf-parse";
import Knowledge from "../modal/knowledgeSchema.js";
import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


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
        const { question } = req.body;
        console.log("Received question:", question);

        if (!question) {
            return res.status(400).json({ answer: "Question is required." });
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