"use strict";
import { middleware } from "#App/Middlewares/RouteMiddleware.js";
import Controller from "#Controllers/Card.ctrl.js";
import Node from "#Node";

try {
  Node.Router.route("/columns/:id/cards")
    .post(middleware, Controller.post);

  Node.Router.route("/cards/:id")
    .patch(middleware, Controller.patch)
    .delete(middleware, Controller.delete);

  Node.Router.route("/cards/:id/move")
    .post(middleware, Controller.move);
} catch (error) {
  console.error("Error in Card Routes:", error);
}

export default Node.Router;
