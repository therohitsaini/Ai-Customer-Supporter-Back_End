import axios from "axios";
import dotenv from "dotenv";
dotenv.config();



export const docs = [
    {
        id: "pricing",
        keywords: ["price", "pricing", "plan", "cost"],
        content: `
Our Pricing Plans:
- Basic Plan: Free
- Pro Plan: ₹999 per month
- Enterprise: Contact sales
    `
    },
    {
        id: "setup",
        keywords: ["setup", "install", "how to use"],
        content: `
Setup Guide:
1. firstly sign up on our platform
2. Enable chat widget from dashboard
    `
    }
];


export function findRelevantDoc(question) {
    const q = question.toLowerCase();

    return docs.find(doc =>
        doc.keywords.some(keyword => q.includes(keyword))
    );
}


export const handleChatRequest = async (req, res) => {
    const userMessage = req.body.message;
    console.log("User Question:", userMessage);

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    const matchedDoc = findRelevantDoc(userMessage);
    if (!matchedDoc) {
        return res.json({
            reply: "This information is not available in our documentation."
        });
    }
    const prompt = `
                    You are a customer support AI.

                    Rules:
                    - Answer ONLY using the documentation below
                    - If answer not found, say "Please contact support"

                    Documentation:
                    ${matchedDoc.content}

                    User Question:
                    ${userMessage}
                    `;

    try {
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

        res.json({
            reply: response.data.response || response.data
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "AI failed to respond" });
    }
};