"use strict";
import { HTTP_STATUS_CODE } from "#App/HttpResponse/Index.js";
import { HttpResponse, errorResponse } from "#App/HttpResponse/Response.js";
import { withSocketEmit } from "#App/Utils/Index.js";
import { create, move, remove, update } from "#Services/Card.service.js";
const keyword = "Card";

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

  move: async (req, res) => {
    try {
      withSocketEmit(req);
      const payload = await move(req);
      return new HttpResponse(res, [HTTP_STATUS_CODE.OK, payload], `${keyword} moved`);
    } catch (error) {
      return new HttpResponse(res, errorResponse(error));
    }
  },
};
