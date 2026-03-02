import express from 'express';
import { handleChatRequest } from '../controller/apiFreellmController.js';
const apiFreellm = express.Router();

// Use POST instead of GET
apiFreellm.post("/", handleChatRequest);

export default apiFreellm;
