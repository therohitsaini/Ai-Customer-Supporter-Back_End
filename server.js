import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./utiles/db.js";
import apiFreellm from "./routes/apiFreellmRoutes.js";
import userInfoRoute from "./authRoute/userLoginInfoRoute.js";
import onbordingRoute from "./routes/onbordingRoute.js";
import chatWidgetRoute from "./routes/widgetSettingsRoute.js";
import fqaRouter from "./routes/fqaRoute.js";
import patnerAdminRouter from "./routes/patnerAdminRoutes.js";
// import fqaRouter from "./routes/fqaRoute.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/freellm", apiFreellm);
app.use("/api/user", userInfoRoute);
app.use("/api/onbording", onbordingRoute);
app.use("/api/widget", chatWidgetRoute);
app.use("/api/faq", fqaRouter);
app.use("/api/patner/admin", patnerAdminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});