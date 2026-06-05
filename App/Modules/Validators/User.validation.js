import Node from "#Node";
import { email, PASSWORD_ERROR_MESSAGE, PASSWORD_PATTERN } from "#App/Common/Validator.js";

export const registerSchema = Node.Joi.object({
  name: Node.Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": `Name is required.`,
    "any.required": `Name is required.`,
  }),
  email: email,
  password: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
});

export const loginSchema = Node.Joi.object({
  email: email,
  password: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
});
