import { Company } from "../modal/onbordingSchema.js";
import widgetSettingsSchema from "../modal/widgetSettingsSchema.js";
import client from "../utiles/rediesdb.js";

const WIDGET_CACHE_TTL = 3600; // 1 hour

export const upsertWidgetSettings = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {
            primaryColor, fontFamily, borderRadius, position,
            welcomeMessage, botName, sendButtonColor, sendButtonTextColor
        } = req.body;

        const updatedSettings = await widgetSettingsSchema.findOneAndUpdate(
            { userId },
            {
                $set: {
                    primaryColor, fontFamily, borderRadius, position,
                    welcomeMessage, botName, sendButtonColor, sendButtonTextColor
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Invalidate cache on update
        await client.del(`widget:${userId}`);

        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWidgetSettings = async (req, res) => {
    try {
        const { userId, domain } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Try cache first
        const cached = await client.get(`widget:${userId}`);
        if (cached) {
            const { settings, companies } = JSON.parse(cached);
            if (!companies.some(c => c.website === domain)) {
                return res.status(403).json({ success: false, message: "Unauthorized domain" });
            }
            return res.status(200).json({ success: true, data: settings });
        }

        const settings = await widgetSettingsSchema.findOne({ userId });
        const companies = await Company.find({ userId });

        if (!companies.some(c => c.website === domain)) {
            return res.status(403).json({ success: false, message: "Unauthorized domain" });
        }
        if (!settings) {
            return res.status(404).json({ success: false, message: "Widget settings not found for this user" });
        }

        // Cache result
        await client.setEx(`widget:${userId}`, WIDGET_CACHE_TTL, JSON.stringify({ settings, companies }));

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
