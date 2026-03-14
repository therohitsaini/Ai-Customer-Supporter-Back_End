import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        widgetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WidgetSettings",
            // required: true
        },

        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userInfo",
            required: true
        },

        sessionId: {
            type: String, // unique id for visitor chat session
            // required: true
        },

        sender: {
            type: String,
            enum: ["user", "bot", "admin"],
            required: true
        },

        message: {
            type: String,
            required: true
        },

        visitorId: {
            type: String // track website visitor
        },

        metadata: {
            type: Object // optional (doc source, tokens, etc.)
        }

    },
    { timestamps: true }
);

export const chatHistory = mongoose.model("chatHistory", chatSchema);