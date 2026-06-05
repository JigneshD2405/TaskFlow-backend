import Node from "#Node";

export const cardSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": `Title is required.`,
    "any.required": `Title is required.`,
  }),
  description: Node.Joi.string().trim().max(5000).allow("").optional(),
  assigneeId: Node.Joi.string().allow(null, "").optional(),
  dueDate: Node.Joi.date().allow(null).optional(),
  priority: Node.Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  order: Node.Joi.number().integer().min(0).optional(),
});

export const cardUpdateSchema = Node.Joi.object({
  title: Node.Joi.string().trim().min(1).max(500).optional(),
  description: Node.Joi.string().trim().max(5000).allow("").optional(),
  assigneeId: Node.Joi.string().allow(null, "").optional(),
  dueDate: Node.Joi.date().allow(null).optional(),
  priority: Node.Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  order: Node.Joi.number().integer().min(0).optional(),
});

export const cardMoveSchema = Node.Joi.object({
  targetColumnId: Node.Joi.string().required().messages({
    "string.empty": `Target Column is required.`,
    "any.required": `Target Column is required.`,
  }),
  order: Node.Joi.number().integer().min(0).required(),
});
