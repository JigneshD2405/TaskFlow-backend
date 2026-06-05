"use strict";
import Node from "#Node";

export const objectId = Node.Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Must be a valid MongoDB ObjectId",
  });


export const PASSWORD_PATTERN = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$");

export const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const email = Node.Joi.string().email().required().messages({
  "string.empty": `Email is required`,
  "any.required": `Email is required`,
  "string.email": `Email must be a valid email`,
});
