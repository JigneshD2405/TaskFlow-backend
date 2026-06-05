"use strict";
import Node from "#Node";
import { verifyAccessToken, withSocketEmit } from "#App/Utils/Index.js"
import User from "#Models/User.model.js"

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
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const [type, token] = authHeader.split(" ");
      if (type !== "Bearer" || !token) {

        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const payload = verifyAccessToken(token);
      if (!payload || payload.status === 400 || !payload.data?._id) {

        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const login_user = await User.findOne({
        _id: new Node.Mongoose.Types.ObjectId(payload.data._id),
        deleted: false,
      });

      if (!login_user) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      req.login_user = login_user;
      req.token = token;
      withSocketEmit(req);
      next();
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  },
};

export default middleware;
