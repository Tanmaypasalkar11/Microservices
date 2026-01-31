const { z } = require("zod");

const createTodoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

const updateTodoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

module.exports = {
  createTodoSchema,
  updateTodoSchema,
};
