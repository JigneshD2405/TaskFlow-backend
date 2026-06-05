"use strict";
import { middleware } from "#App/Middlewares/RouteMiddleware.js";
import Controller from "#Controllers/User.ctrl.js";
import Node from "#Node";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

try {
  Node.Router.post("/register", authLimiter, middleware, Controller.register);
  Node.Router.post("/sign-in", authLimiter, middleware, Controller.login);
  Node.Router.post("/refresh-token", middleware, Controller.refreshToken);
  Node.Router.post("/sign-out", middleware, Controller.logout);
  Node.Router.get("/auth", middleware, Controller.auth);
  Node.Router.get("/users/search", middleware, Controller.search);
} catch (error) {
  console.error("Error in Auth Routes:", error);
}

export default Node.Router;
