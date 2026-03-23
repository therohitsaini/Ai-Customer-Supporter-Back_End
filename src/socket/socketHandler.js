import { Server } from "socket.io";
import mongoose from "mongoose";
import chatList from "../../modal/chatList.js";

let io;

// Map<userId, Set<socketId>>
const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("register_user", async ({ userId }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId)) return;
                console.log("Register user:", userId);
                socket.userId = userId;

                if (!onlineUsers.has(userId)) {
                    onlineUsers.set(userId, new Set());
                }

                onlineUsers.get(userId).add(socket.id);
                socket.join(userId);
                
                await chatList.findByIdAndUpdate(userId, {
                    isActive: true,
                });

            } catch (err) {
                console.error("Register error:", err);
            }
        });

        // ============================
        // JOIN CHAT ROOM
        // ============================
        socket.on("join_chat", ({ widgetId, visitorId }) => {
            const room = `${widgetId}_${visitorId}`;
            socket.join(room);
        });

        // ============================
        // SEND MESSAGE
        // ============================
        socket.on("send_message", (data) => {
            const room = `${data.widgetId}_${data.visitorId}`;

            // send to room (both admin + visitor)
            io.to(room).emit("receive_message", data);

            // 🔥 OPTIONAL: send to all admin devices
            const sockets = onlineUsers.get(data.adminId);

            if (sockets) {
                sockets.forEach((socketId) => {
                    io.to(socketId).emit("receive_message", data);
                });
            }
        });

        // ============================
        // DISCONNECT
        // ============================
        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);

            const userId = socket.userId;
            if (!userId) return;

            const sockets = onlineUsers.get(userId);
            if (!sockets) return;

            // remove this socket
            sockets.delete(socket.id);

            // ❗ if no sockets left → user offline
            if (sockets.size === 0) {
                onlineUsers.delete(userId);

                try {
                    await chatList.findByIdAndUpdate(userId, {
                        isActive: false,
                    });

                    console.log("User set offline:", userId);
                } catch (err) {
                    console.error("Disconnect DB error:", err);
                }
            }
        });
    });
};

// ============================
// GET IO INSTANCE
// ============================
export const getIO = () => io;

// ============================
// GET USER SOCKETS (multi-device)
// ============================
export const getUserSockets = (userId) => {
    return onlineUsers.get(userId) || new Set();
};