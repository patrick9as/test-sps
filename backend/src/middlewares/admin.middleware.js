const { ERROR_KEYS } = require("../config/constants");
const { sendError } = require("../utils/errors");

/**
 * Usado em PUT/DELETE /users/:id.
 * Se o alvo (req.params.id) não for o próprio usuário (req.user.id),
 * exige req.user.type === "admin". Caso contrário -> 403 com mensagem
 * de que apenas admin pode editar/excluir outros usuários.
 */
function requireAdminForOther(req, res, next) {
  const targetId = req.params.id;
  const currentUserId = req.user?.id;
  const isSelf = targetId === currentUserId;
  if (isSelf) return next();
  if (req.user?.type === "admin") return next();
  return sendError(res, 403, ERROR_KEYS.USERS_ONLY_ADMIN_CAN_MODIFY_OTHERS);
}

module.exports = { requireAdminForOther };
