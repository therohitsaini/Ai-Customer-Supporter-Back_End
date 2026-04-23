import bcrypt from "bcrypt";
import { validateEmail } from "../helper/emailValidate.js";
import { userInfo } from "../modal/userSchema.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Company } from "../modal/onbordingSchema.js";
import client from "../utiles/rediesdb.js";

dotenv.config();

export const userResgisterInfo = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await userInfo.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userInfo({ email, name, password: hashedPassword });
        await user.save();

        return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const userLoginInfo = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check cached user session
        const cachedUser = await client.get(`user:${email}`);
        let user;
        if (cachedUser) {
            user = JSON.parse(cachedUser);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
        } else {
            user = await userInfo.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            // Cache user for 1 hour
            await client.setEx(`user:${email}`, 3600, JSON.stringify(user));
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const checkOnbording = await Company.findOne({ userId: user._id });
        return res.status(200).json({
            message: "Login successful",
            data: user,
            token,
            isOnboarded: checkOnbording ? true : false
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const userLogout = async (req, res) => {
    try {
        const token = req.token;
        const decoded = jwt.decode(token);
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);

        if (ttl > 0) {
            await client.setEx(`blacklist:${token}`, ttl, "1");
        }

        // Clear user cache
        await client.del(`user:${req.user.email}`);

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
