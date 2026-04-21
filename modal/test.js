import mongoose from "mongoose";

const chatListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    email: {
        type: String,
        required: true
    }

}, { timestamps: true });

const test_ = mongoose.model("test_", chatListSchema);
export default test_;