import express from "express";
import test_ from "../modal/test.js";
const router = express.Router();
router.post("/test", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }
        await test_.create({ name, email });
        res.json({ message: "Test successful", name, email });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;