import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Knowledge = mongoose.model("Knowledge", knowledgeSchema);
export default Knowledge;