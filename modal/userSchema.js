import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
const userInfo = mongoose.model("userInfo", userSchema);
export { userInfo };