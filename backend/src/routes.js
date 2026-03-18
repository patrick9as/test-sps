const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const { ERROR_KEYS } = require("./config/constants");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/users.controller");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { requireAdminForOther } = require("./middlewares/admin.middleware");
const { loginLimiter } = require("./middlewares/loginRateLimit");
const { asyncHandler } = require("./utils/asyncHandler");
const { sendError } = require("./utils/errors");

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

// Rotas públicas
routes.get("/health", (_, res) => {
  // Health check - verifica se o servidor está funcionando e em qual modo de armazenamento
  const storage = process.env.STORAGE || "memory";
  res.json({ data: { status: "ok", storage } });
});

// Rota de login - autenticação (limitada a 5 falhas por 15 min)
routes.post("/login", loginLimiter, asyncHandler(authController.login));

// Rotas protegidas
const usersRouter = Router();
// Middleware de autenticação para todas as rotas de usuários
usersRouter.use(authMiddleware);

const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (!ok) req.fileValidationError = "invalid_file_type";
    cb(null, ok);
  },
});

function uploadSingleProfilePicture(req, res, next) {
  uploadProfilePicture.single("profilePicture")(req, res, (err) => {
    if (err || req.fileValidationError) {
      return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
        data: [{ path: "profilePicture", message: ERROR_KEYS.VALIDATION_INVALID_BODY }],
      });
    }
    return next();
  });
}

// Rotas de usuários
usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.get("/:id", asyncHandler(usersController.getById));
usersRouter.post("/", asyncHandler(usersController.create));
usersRouter.put("/:id", requireAdminForOther, asyncHandler(usersController.update));
usersRouter.post(
  "/:id/profile-picture",
  requireAdminForOther,
  uploadSingleProfilePicture,
  asyncHandler(usersController.uploadProfilePicture),
);
usersRouter.get(
  "/:id/profile-picture",
  requireAdminForOther,
  asyncHandler(usersController.getProfilePicture),
);
usersRouter.delete("/:id", requireAdminForOther, asyncHandler(usersController.remove));
// Adiciona as rotas de usuários ao router principal
routes.use("/users", usersRouter);

module.exports = routes;
