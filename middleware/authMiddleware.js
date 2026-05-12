import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../utiles/rediesdb.js";

dotenv.config();

export const verifyTokenMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Authorization verify hon rha hai middle ware ke sath ", authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ valid: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Check if token is blacklisted
        const isBlacklisted = await client.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ valid: false, message: "Token has been revoked" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
};
