"use strict";
import { HTTP_STATUS_CODE } from "#App/HttpResponse/Index.js";
import { HttpResponse, errorResponse } from "#App/HttpResponse/Response.js";
import { create, getById, list, remove, update } from "#Services/Board.service.js";
const keyword = "Board";

export default {
  post: async (req, res) => {
    try {
      const payload = await create(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CREATED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  get: async (req, res) => {
    try {
      const payload = await getById(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.GETTED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  list: async (req, res) => {
    try {
      const payload = await list(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.LIST, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  patch: async (req, res) => {
    try {
      const payload = await update(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.UPDATED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  delete: async (req, res) => {
    try {
      await remove(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.DELETED], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },
};
