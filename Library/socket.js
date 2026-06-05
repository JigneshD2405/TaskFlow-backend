"use strict";
import Node from "#Node";
import { Server } from "socket.io";

export const load = () => {
  try {
    console.info("Loading... Node Socket.");

    Node.Socket = new Server(Node.HttpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 10000,
    });

    Node.Socket.use(async (socket, next) => {
      try {
        const authHeader = socket.handshake.auth.token;
        if (!authHeader) return next(new Error("Unauthorized user"));

        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) return next(new Error("Unauthorized user"));

        const payload = await Node.App.Utils.Index.verifyAccessToken(token);
        if (!payload || payload.status === 400 || !payload.data?._id) {
          return next(new Error("Unauthorized user"));
        }

        socket.login_user = payload.data;
        socket.login_user._id = new Node.Mongoose.Types.ObjectId(payload.data._id);
        next();
      } catch (error) {
        return next(new Error("Internal Server Error"));
      }
    });

    Node.Socket.on("connection", (socket) => {
      console.info(`New client connected: ${socket.id}`);

      socket.on("join-board", (boardId) => {
        socket.join(`board:${boardId}`);
        socket.to(`board:${boardId}`).emit("user:joined", {
          userId: socket.login_user._id,
          boardId,
        });
        console.log(`Socket ${socket.id} joined board:${boardId}`);
      });

      socket.on("leave-board", (boardId) => {
        socket.leave(`board:${boardId}`);
        socket.to(`board:${boardId}`).emit("user:left", {
          userId: socket.login_user._id,
          boardId,
        });
      });

      socket.on("disconnect", () => {
        console.info(`Client disconnected: ${socket.id}`);
      });

      socket.on("error", (err) => {
        console.log("Socket Error:", err);
        socket.disconnect();
      });
    });
  } catch (error) {
    console.log("Error occurred in Socket:", error);
  }
};
