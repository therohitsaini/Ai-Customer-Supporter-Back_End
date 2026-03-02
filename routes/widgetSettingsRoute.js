import express from "express";
import { upsertWidgetSettings, getWidgetSettings } from "../controller/widgetSettingsController.js";

const chatWidgetRoute = express.Router();

chatWidgetRoute.post("/widget-settings/:userId", upsertWidgetSettings);
chatWidgetRoute.get("/fetch/widget-settings/:userId", getWidgetSettings);

export default chatWidgetRoute;
