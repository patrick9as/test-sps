const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { ERROR_KEYS } = require("./config/constants");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/users.controller");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { requireAdminForOther } = require("./middlewares/admin.middleware");
const { asyncHandler } = require("./utils/asyncHandler");

const routes = Router();

// Handler comum para respostas 429 (rate limit excedido)
function rateLimitHandler(req, res) {
  const info = req.rateLimit || {};
  const resetAt =
    info.resetTime instanceof Date
      ? Math.floor(info.resetTime.getTime() / 1000)
      : info.resetTime;
  res.status(429).json({
    error: ERROR_KEYS.RATE_LIMIT_EXCEEDED,
    remaining: info.remaining ?? 0,
    limit: info.limit ?? 100,
    resetAt,
  });
}

const isTest = process.env.NODE_ENV === "test";

// Rate limit global: 100 requisições por 15 min para todas as rotas (relaxado em test)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 100,
  standardHeaders: true,
  handler: rateLimitHandler,
});
routes.use(limiter);

// Rate limit de login: 5 tentativas (apenas falhas) por 15 min (relaxado em test)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 5,
  standardHeaders: true,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler,
});

// Rotas públicas
routes.get("/health", (_, res) => {
  // Health check - verifica se o servidor está funcionando
  res.json({ data: { status: "ok" } });
});

// Rota de login - autenticação (limitada a 5 falhas por 15 min)
routes.post("/login", loginLimiter, asyncHandler(authController.login));

// Rotas protegidas
const usersRouter = Router();
// Middleware de autenticação para todas as rotas de usuários
usersRouter.use(authMiddleware);

// Rotas de usuários
usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.get("/:id", asyncHandler(usersController.getById));
usersRouter.post("/", asyncHandler(usersController.create));
usersRouter.put("/:id", requireAdminForOther, asyncHandler(usersController.update));
usersRouter.delete("/:id", requireAdminForOther, asyncHandler(usersController.remove));
// Adiciona as rotas de usuários ao router principal
routes.use("/users", usersRouter);

module.exports = routes;
