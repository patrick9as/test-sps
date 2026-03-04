const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  type: z.enum(["admin", "user"]),
  password: z.string().min(1),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  type: z.enum(["admin", "user"]).optional(),
  password: z.string().min(1).optional(),
});

/**
 * Formata erros Zod para { path, message }[].
 * @param {z.ZodError} error
 * @returns {Array<{ path: string; message: string }>}
 */
function formatZodErrors(error) {
  return error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
}

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  formatZodErrors,
};
