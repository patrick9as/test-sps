const { z } = require("zod");

// Regras de senha: mínimo 7 caracteres, pelo menos 1 maiúscula, 1 número e 1 caractere especial
const passwordSchema = z
  .string()
  .min(7, "validation.password_min_length")
  .refine((s) => /[A-Z]/.test(s), { message: "validation.password_uppercase" })
  .refine((s) => /[0-9]/.test(s), { message: "validation.password_number" })
  .refine((s) => /[^a-zA-Z0-9]/.test(s), { message: "validation.password_special" });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  type: z.enum(["admin", "user"]),
  password: passwordSchema,
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  type: z.enum(["admin", "user"]).optional(),
  password: passwordSchema.optional(),
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
