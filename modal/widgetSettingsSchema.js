import mongoose from "mongoose";

const widgetSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true   // 1 user = 1 widget config
    },

    primaryColor: {
        type: String,
        default: "#0e0f0e"
    },

    fontFamily: {
        type: String,
        default: "Arial"
    },

    borderRadius: {
        type: Number,
        default: 0
    },

    position: {
        type: String,
        enum: ["left", "right"],
        default: "right"
    },

    welcomeMessage: {
        type: String,
        default: "Hi! How can I help you?"
    },

    botName: {
        type: String,
        default: "AI Assistant"
    },
    sendButtonColor: {
        type: String,
        default: "#0e0f0e"
    },
    sendButtonTextColor: {
        type: String,
        default: "#ffffff"
    }


}, { timestamps: true });

export default mongoose.model("WidgetSettings", widgetSettingsSchema);
