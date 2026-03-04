const { Router } = require("express");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/users.controller");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { requireAdminForOther } = require("./middlewares/admin.middleware");
const { asyncHandler } = require("./utils/asyncHandler");

const routes = Router();

routes.get("/health", (_, res) => {
  res.json({ data: { status: "ok" } });
});

routes.post("/login", asyncHandler(authController.login));

const usersRouter = Router();
usersRouter.use(authMiddleware);
usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.get("/:id", asyncHandler(usersController.getById));
usersRouter.post("/", asyncHandler(usersController.create));
usersRouter.put("/:id", requireAdminForOther, asyncHandler(usersController.update));
usersRouter.delete("/:id", requireAdminForOther, asyncHandler(usersController.remove));
routes.use("/users", usersRouter);

module.exports = routes;
