import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import mongoose from "mongoose";
import chatList from "../../modal/chatList.js";
import client from "../../utiles/rediesdb.js";

let io;

// In-memory fallback for single-process socket tracking
const onlineUsers = new Map();

const ONLINE_TTL = 86400; // 24 hours

export const initSocket = async (server) => {
    // Create a separate pub/sub client pair for the Redis adapter
    const pubClient = client;
    const subClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    await subClient.connect();

    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register_user", async ({ userId }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId)) return;
                socket.userId = userId;

                // Track in memory + Redis
                if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
                onlineUsers.get(userId).add(socket.id);
                socket.join(userId);

                await client.sAdd(`online:${userId}`, socket.id);
                await client.expire(`online:${userId}`, ONLINE_TTL);

                await chatList.findByIdAndUpdate(userId, { isActive: true });
            } catch (err) {
                console.error("Register error:", err);
            }
        });

        socket.on("join_chat", ({ widgetId, visitorId }) => {
            const room = `${widgetId}_${visitorId}`;
            socket.join(room);
        });

        socket.on("send_message", (data) => {
            const room = `${data.widgetId}_${data.visitorId}`;
            io.to(room).emit("receive_message", data);

            const sockets = onlineUsers.get(data.adminId);
            if (sockets) {
                sockets.forEach((socketId) => {
                    io.to(socketId).emit("receive_message", data);
                });
            }
        });

        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            const userId = socket.userId;
            if (!userId) return;

            // Remove from memory
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) onlineUsers.delete(userId);
            }

            // Remove from Redis
            await client.sRem(`online:${userId}`, socket.id);
            const remaining = await client.sCard(`online:${userId}`);

            if (remaining === 0) {
                await client.del(`online:${userId}`);
                try {
                    await chatList.findByIdAndUpdate(userId, { isActive: false });
                    console.log("User set offline:", userId);
                } catch (err) {
                    console.error("Disconnect DB error:", err);
                }
            }
        });
    });
};

export const getIO = () => io;

export const getUserSockets = (userId) => {
    return onlineUsers.get(userId) || new Set();
};
