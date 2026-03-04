const bcrypt = require("bcryptjs");
const { ERROR_KEYS } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const {
  createUserSchema,
  updateUserSchema,
  formatZodErrors,
} = require("../validators/user.schema");
const { sendError } = require("../utils/errors");

async function list(_, res) {
  // Busca todos os usuários
  const users = await userRepository.findAll();
  res.json({ data: users });
}

async function getById(req, res) {
  // Busca o usuário pelo ID passado na URL
  const { id } = req.params;
  const user = await userRepository.findById(id);

  if (!user) {
    // Retorna um erro 404 se o usuário não for encontrado
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  res.json({ data: user });
}

async function create(req, res) {
  // Valida o corpo da requisição usando o schema de criação de usuário
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    // Retorna um erro 400 se a validação falhar
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }

  // Extrai os dados do usuário do corpo da requisição
  const { name, email, type, password } = parsed.data;
  if (type === "admin" && req.user.type !== "admin") {
    // Retorna um erro 403 se o usuário não for admin e tentar criar um admin
    return sendError(res, 403, ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
  }

  if (await userRepository.emailExists(email)) {
    // Retorna um erro 409 se o email já estiver em uso
    return sendError(res, 409, ERROR_KEYS.AUTH_EMAIL_TAKEN);
  }

  // Cria o usuário no repositório com o hash da senha
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, type, passwordHash });

  res.status(201).json({ data: user });
}

async function update(req, res) {
  const { id } = req.params;
  // Apenas o admin padrão não pode ser alterado; outros admins podem alterar o próprio cargo (ex.: admin → user).
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, ERROR_KEYS.USERS_DEFAULT_USER_CANNOT_BE_MODIFIED);
  }

  // Valida o corpo da requisição usando o schema de atualização de usuário
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    // Retorna um erro 400 se a validação falhar
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }

  // Busca o usuário pelo ID passado na URL
  const existing = await userRepository.findByIdWithPassword(id);

  if (!existing) {
    // Retorna um erro 404 se o usuário não for encontrado
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  const updates = { ...parsed.data };

  if (updates.type === "admin" && req.user.type !== "admin") {
    // Retorna um erro 403 se o usuário não for admin e tentar atualizar o tipo para admin
    return sendError(res, 403, ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
  }

  if (updates.password) {
    // Gera o hash da senha
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  // Verifica se o email já está em uso
  if (updates.email && (await userRepository.emailExists(updates.email, id))) {
    return sendError(res, 409, ERROR_KEYS.AUTH_EMAIL_TAKEN);
  }

  // Prepara os dados a serem armazenados no repositório
  const toStore = {};
  if (updates.name !== undefined) toStore.name = updates.name;
  if (updates.email !== undefined) toStore.email = updates.email;
  if (updates.type !== undefined) toStore.type = updates.type;
  if (updates.passwordHash !== undefined) toStore.passwordHash = updates.passwordHash;

  // Atualiza o usuário no repositório
  const user = await userRepository.update(id, toStore);

  res.json({ data: user });
}

async function remove(req, res) {
  // Exclui o usuário pelo ID passado na URL
  const { id } = req.params;

  if (id === req.user.id) {
    // Retorna um erro 403 se o usuário tentar excluir a si mesmo
    return sendError(res, 403, ERROR_KEYS.USERS_CANNOT_DELETE_SELF);
  }
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, ERROR_KEYS.USERS_DEFAULT_USER_CANNOT_BE_DELETED);
  }

  // Verifica se o usuário existe
  const existed = await userRepository.remove(id);

  if (!existed) {
    // Retorna um erro 404 se o usuário não for encontrado
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }
  
  res.status(200).json({ message: ERROR_KEYS.USERS_DELETED });
}

module.exports = { list, getById, create, update, remove };
