"use strict";
import { HTTP_STATUS_CODE } from "#App/HttpResponse/Index.js";
import { HttpResponse, errorResponse } from "#App/HttpResponse/Response.js";
import { login, logout, refreshToken, register } from "#Services/User.service.js";
const keyword = "User"
export default {
  register: async (req, res) => {
    try {
      const payload = await register(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CREATED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  login: async (req, res) => {
    try {
      const payload = await login(req, res);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CUSTOM_SUCCESS, payload], "Login successfully");
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  refreshToken: async (req, res) => {
    try {
      const payload = await refreshToken(req, res);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CUSTOM_SUCCESS, payload], "Token refreshed successfully");
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  logout: async (req, res) => {
    try {
      await logout(req, res);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CUSTOM_SUCCESS], "Logout successfully");
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  auth: async (req, res) => {
    try {
      const user = req.login_user;
      const payload = { _id: user._id, name: user.name, email: user.email };
      return new HttpResponse(res, [HTTP_STATUS_CODE.GETTED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },
};
