import bcrypt from "bcrypt";
import { validateEmail } from "../helper/emailValidate.js";
import { userInfo } from "../modal/userSchema.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Company } from "../modal/onbordingSchema.js";

dotenv.config();

export const userResgisterInfo = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("User Registration Info:", email, password);

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }
        // email = email.toLowerCase();
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }


        const existingUser = await userInfo.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // In production, hash the password before saving
        const user = new userInfo({ email, password: hashedPassword });
        await user.save();
        return res.status(201).json({ message: "User registered successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const userLoginInfo = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("User Login Info:", email, password);

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await userInfo.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );
        const checkOnbording = await Company.findOne({ userId: user._id });
        return res.status(200).json({ message: "Login successful", data: user, token, isOnboarded: checkOnbording ? true : false });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export { userLoginInfo };
