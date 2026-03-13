import { Company } from "../modal/onbordingSchema.js";
import widgetSettingsSchema from "../modal/widgetSettingsSchema.js";



export const upsertWidgetSettings = async (req, res) => {
    try {
        const userId = req.params.userId
        const {
            primaryColor,
            fontFamily,
            borderRadius,
            position,
            welcomeMessage,
            botName,
            sendButtonColor,
            sendButtonTextColor
        } = req.body;

        const updatedSettings = await widgetSettingsSchema.findOneAndUpdate(
            { userId }, // find by user
            {
                $set: {
                    primaryColor,
                    fontFamily,
                    borderRadius,
                    position,
                    welcomeMessage,
                    botName,
                    sendButtonColor,
                    sendButtonTextColor
                }
            },
            {
                new: true,
                upsert: true,     // create if not exists
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: updatedSettings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getWidgetSettings = async (req, res) => {
    try {
        const { userId, domain } = req.params;
        console.log(`Fetching widget settings for userId: ${userId} and domain: ${domain}`);
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        const settings = await widgetSettingsSchema.findOne({ userId });
        const companies = await Company.find({ userId });
        if (!companies.some(company => company.website === domain)) {
            console.log(`Domain mismatch: widget domain (${settings.website}) does not match request domain (${domain})`);
            return res.status(403).json({
                success: false,
                message: "Unauthorized domain"
            });
        }

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Widget settings not found for this user"
            });
        }
        console.log("Widget settings found:", settings);
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
