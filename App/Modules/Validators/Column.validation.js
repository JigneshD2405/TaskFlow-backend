import Node from "#Node";

export const columnSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": `Title is required.`,
    "any.required": `Title is required.`,
  }),
  order: Node.Joi.number().integer().min(0).optional(),
});

export const columnUpdateSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(200).optional(),
  order: Node.Joi.number().integer().min(0).optional(),
});
