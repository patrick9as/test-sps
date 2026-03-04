const jwt = require("jsonwebtoken");
const { ERROR_KEYS, getJwtSecret } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const { sendError } = require("../utils/errors");

/**
 * Middleware que valida JWT e define req.user (id, email, type).
 * Verifica também se o usuário ainda existe no repositório.
 * Token inválido, ausente ou usuário inexistente -> 401 { error: "auth.invalid_token" }.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_TOKEN);
  }
  const token = authHeader.slice(7);
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_TOKEN);
    }
    req.user = {
      id: user.id,
      email: user.email,
      type: user.type,
    };
    next();
  } catch {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_TOKEN);
  }
}

module.exports = { authMiddleware };
