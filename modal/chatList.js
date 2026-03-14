import mongoose from "mongoose";

const chatListSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userInfo",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    lastMessage: {
        type: String,
        required: true
    },
}, { timestamps: true });

const chatList = mongoose.model("chatList", chatListSchema);
export default chatList;