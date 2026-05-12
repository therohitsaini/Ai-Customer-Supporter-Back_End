import express from "express";
import { upsertWidgetSettings, getWidgetSettings, WidgetSettingsLivePreview } from "../controller/widgetSettingsController.js";

const chatWidgetRoute = express.Router();

chatWidgetRoute.post("/widget-settings/:userId", upsertWidgetSettings);
chatWidgetRoute.get("/fetch/widget-settings/:userId/:domain", getWidgetSettings);
chatWidgetRoute.get("/live-preview/:userId", WidgetSettingsLivePreview);
export default chatWidgetRoute;
