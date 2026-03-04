const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ERROR_KEYS, getJwtSecret, getJwtExpiresIn } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const { loginSchema, formatZodErrors } = require("../validators/user.schema");
const { sendError } = require("../utils/errors");

/**
 * POST /login - body: { email, password }. Retorna { data: { token } }.
 */
async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }
  const { email, password } = parsed.data;
  const user = userRepository.findByEmailWithPassword(email);
  if (!user) {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_CREDENTIALS, {
      remaining: req.rateLimit?.remaining ?? 0,
    });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_CREDENTIALS, {
      remaining: req.rateLimit?.remaining ?? 0,
    });
  }
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();
  const token = jwt.sign(
    { sub: user.id, email: user.email, type: user.type },
    secret,
    { expiresIn }
  );
  res.status(200).json({ data: { token } });
}

module.exports = { login };
