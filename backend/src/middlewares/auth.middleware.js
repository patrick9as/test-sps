const jwt = require("jsonwebtoken");
const { ERROR_KEYS, getJwtSecret } = require("../config/constants");
const { sendError } = require("../utils/errors");

/**
 * Middleware que valida JWT e define req.user (id, email, type).
 * Token inválido ou ausente -> 401 { error: "auth.invalid_token" }.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_TOKEN);
  }
  const token = authHeader.slice(7);
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
    };
    next();
  } catch {
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_TOKEN);
  }
}

module.exports = { authMiddleware };
