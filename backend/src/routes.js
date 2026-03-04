const { Router } = require("express");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/users.controller");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { requireAdminForOther } = require("./middlewares/admin.middleware");
const { asyncHandler } = require("./utils/asyncHandler");

const routes = Router();

// Rotas públicas
routes.get("/health", (_, res) => {
  // Health check - verifica se o servidor está funcionando
  res.json({ data: { status: "ok" } });
});

// Rota de login - autenticação
routes.post("/login", asyncHandler(authController.login));

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
