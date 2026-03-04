const { z } = require("zod");
const { ERROR_KEYS } = require("../config/constants");

// Regras de senha: mínimo 7 caracteres, pelo menos 1 maiúscula, 1 número e 1 caractere especial
const passwordSchema = z
  .string()
  .min(7, ERROR_KEYS.VALIDATION_PASSWORD_MIN_LENGTH)
  .refine((s) => /[A-Z]/.test(s), { message: ERROR_KEYS.VALIDATION_PASSWORD_UPPERCASE })
  .refine((s) => /[0-9]/.test(s), { message: ERROR_KEYS.VALIDATION_PASSWORD_NUMBER })
  .refine((s) => /[^a-zA-Z0-9]/.test(s), { message: ERROR_KEYS.VALIDATION_PASSWORD_SPECIAL });

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
