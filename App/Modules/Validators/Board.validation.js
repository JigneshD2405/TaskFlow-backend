import Node from "#Node";

export const boardSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": `Title is required.`,
    "any.required": `Title is required.`,
  }),
  description: Node.Joi.string().trim().max(1000).allow("").optional(),
  members: Node.Joi.array().items(Node.Joi.string()).optional(),
});

export const boardUpdateSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(200).optional(),
  description: Node.Joi.string().trim().max(1000).allow("").optional(),
  members: Node.Joi.array().items(Node.Joi.string()).optional(),
}).unknown(true);
