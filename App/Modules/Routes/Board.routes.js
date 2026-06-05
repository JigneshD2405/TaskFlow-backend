"use strict";
import { middleware } from "#App/Middlewares/RouteMiddleware.js";
import Controller from "#Controllers/Board.ctrl.js";
import Node from "#Node";

try {
  Node.Router.route("/boards")
    .post(middleware, Controller.post)
    .get(middleware, Controller.list);

  Node.Router.route("/boards/:id")
    .get(middleware, Controller.get)
    .patch(middleware, Controller.patch)
    .delete(middleware, Controller.delete);
} catch (error) {
  console.error("Error in Board Routes:", error);
}

export default Node.Router;
