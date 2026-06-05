"use strict";
import { middleware } from "#App/Middlewares/RouteMiddleware.js";
import Controller from "#Controllers/Column.ctrl.js";
import Node from "#Node";

try {
  Node.Router.route("/boards/:id/columns")
    .post(middleware, Controller.post);

  Node.Router.route("/columns/:id")
    .patch(middleware, Controller.patch)
    .delete(middleware, Controller.delete);
} catch (error) {
  console.error("Error in Column Routes:", error);
}

export default Node.Router;
