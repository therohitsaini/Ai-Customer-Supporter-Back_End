import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyTokenMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader); 
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                valid: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            valid: false,
            message: "Invalid or expired token",
        });
    }
};

