import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register_user", ({ userId }) => {
            console.log("User connected:", userId);
            socket.join(userId);

        });

        socket.on("join_chat", ({ widgetId, visitorId }) => {
            const room = `${widgetId}_${visitorId}`;
            socket.join(room);
        });

        socket.on("send_message", (data) => {
            const room = `${data.widgetId}_${data.visitorId}`;

            io.to(room).emit("receive_message", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export const getIO = () => io;