import { Company } from "../modal/onbordingSchema.js";
import crypto from "crypto";

const onBordingController = async (req, res) => {
    try {
        const { companyName, businessType, website, userId } = req.body;
        console.log("Onboarding Data:", companyName, businessType, website);
        if (!companyName || !businessType || !website) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const apiKey = crypto.randomBytes(24).toString("hex");
        const newCompany = new Company({ companyName, businessType, website, userId, apiKey });
        await newCompany.save();
        return res.status(201).json({ message: "Onboarding data saved successfully", company: newCompany });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export default onBordingController;