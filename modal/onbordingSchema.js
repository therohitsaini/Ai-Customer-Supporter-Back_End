import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userInfo",
    },
    companyName: String,
    website: String,
    businessType: String,
    apiKey: String,
    
    isOnboarded: {
        type: Boolean,
        default: false,
    },
});

export const Company = mongoose.model("Company", companySchema);