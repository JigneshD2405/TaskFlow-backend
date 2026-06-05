"use strict";
import { HTTP_STATUS_CODE } from "#App/HttpResponse/Index.js";
import { HttpResponse, errorResponse } from "#App/HttpResponse/Response.js";
import { withSocketEmit } from "#App/Utils/Index.js";
import { create, remove, update } from "#Services/Column.service.js";

const keyword = "Column";

export default {
  post: async (req, res) => {
    try {
      withSocketEmit(req);
      const payload = await create(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.CREATED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  patch: async (req, res) => {
    try {
      withSocketEmit(req);
      const payload = await update(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.UPDATED, payload], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },

  delete: async (req, res) => {
    try {
      withSocketEmit(req);
      await remove(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.DELETED], keyword);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },
};
