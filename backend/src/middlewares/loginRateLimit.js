const rateLimit = require("express-rate-limit");
const { ERROR_KEYS } = require("../config/constants");

function loginRateLimitHandler(req, res) {
  const info = req.rateLimit || {};
  const resetAt =
    info.resetTime instanceof Date
      ? Math.floor(info.resetTime.getTime() / 1000)
      : info.resetTime;
  res.status(429).json({
    error: ERROR_KEYS.RATE_LIMIT_EXCEEDED,
    remaining: info.remaining ?? 0,
    limit: info.limit ?? 5,
    resetAt,
  });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  skipSuccessfulRequests: true,
  handler: loginRateLimitHandler,
});

/**
 * Reseta o contador de tentativas de login para o IP do request.
 * Deve ser chamado quando o login for bem-sucedido.
 */
function resetLoginAttempts(req) {
  if (req?.ip && typeof loginLimiter.resetKey === "function") {
    loginLimiter.resetKey(req.ip);
  }
}

module.exports = { loginLimiter, resetLoginAttempts };
