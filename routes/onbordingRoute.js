import express from 'express';
import onBordingController from '../controller/onbordingController.js';

const onbordingRoute = express.Router();
onbordingRoute.post("/onbording-data", onBordingController);

export default onbordingRoute;