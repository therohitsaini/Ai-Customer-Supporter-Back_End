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
        const userId = req.params.userId;
        console.log("Received request to fetch widget settings for user:", req.body, "with userId:", userId);
        console.log("Fetching widget settings for user:", userId);
        // console.log(req.path)
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        const settings = await widgetSettingsSchema.findOne({ userId });

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
