const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ERROR_KEYS, getJwtSecret, getJwtExpiresIn } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const { loginSchema, formatZodErrors } = require("../validators/user.schema");
const { sendError } = require("../utils/errors");
const { resetLoginAttempts } = require("../middlewares/loginRateLimit");

/**
 * POST /login - body: { email, password }. Retorna { data: { token } }.
 */
async function login(req, res) {
  // Valida o corpo da requisição usando o schema de login
  const parsed = loginSchema.safeParse(req.body);

  // Se a validação falhar, retorna um erro 400 com as mensagens de erro formatadas
  if (!parsed.success) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }

  const { email, password } = parsed.data;

  // Busca o usuário pelo email
  const user = userRepository.findByEmailWithPassword(email);

  // Se o usuário não for encontrado, retorna um erro 401 com as tentativas restantes
  if (!user) {
    // Retorna um erro 401 com as tentativas restantes em caso de falha de autenticação
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_CREDENTIALS, {
      remaining: req.rateLimit?.remaining ?? 0,
    });
  }

  // Compara a senha fornecida com a senha hash do usuário
  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    // Retorna um erro 401 com as tentativas restantes em caso de falha de autenticação
    return sendError(res, 401, ERROR_KEYS.AUTH_INVALID_CREDENTIALS, {
      remaining: req.rateLimit?.remaining ?? 0,
    });
  }

  // Gera o token JWT
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();
  const token = jwt.sign(
    { sub: user.id, email: user.email, type: user.type },
    secret,
    { expiresIn }
  );

  resetLoginAttempts(req);
  const { passwordHash: _, ...publicUser } = user;
  res.status(200).json({ data: { token, user: publicUser } });
}

module.exports = { login };
