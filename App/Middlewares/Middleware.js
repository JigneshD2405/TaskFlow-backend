"use strict";
import Node from "#Node";
import path from "path";

const middleware = {
  authMiddleware: async function (req, res, next) {
    try {
      req.bypassMiddleware = false;

      if (Node.UNPROTECTED_APIS.some((api) => req.path.startsWith(api))) {
        req.bypassMiddleware = true;
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const folder = req.path.split("/")[1];
        if (["Assets", "Documents"].includes(folder)) {
          return res.status(403).sendFile(path.resolve("View/index.html"));
        }
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const [type, token] = authHeader.split(" ");
      if (type !== "Bearer" || !token) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const payload = Node.App.Utils.Index.verifyToken(token);
      if (!payload || payload.status === 400 || !payload.data?._id) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }



      if (!Array.isArray(login_user?.tokens) || !login_user.tokens.some((stored) => stored.trim() === token.trim())) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  },
};

export default middleware;
