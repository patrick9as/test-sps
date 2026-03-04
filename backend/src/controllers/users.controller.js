const bcrypt = require("bcryptjs");
const { ERROR_KEYS } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const {
  createUserSchema,
  updateUserSchema,
  formatZodErrors,
} = require("../validators/user.schema");
const { sendError } = require("../utils/errors");

async function list(req, res) {
  const users = userRepository.findAll();
  res.json({ data: users });
}

async function getById(req, res) {
  const { id } = req.params;
  const user = userRepository.findById(id);
  if (!user) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }
  res.json({ data: user });
}

async function create(req, res) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }
  const { name, email, type, password } = parsed.data;
  if (type === "admin" && req.user.type !== "admin") {
    return sendError(res, 403, ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
  }
  if (userRepository.emailExists(email)) {
    return sendError(res, 409, ERROR_KEYS.AUTH_EMAIL_TAKEN);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepository.create({ name, email, type, passwordHash });
  res.status(201).json({ data: user });
}

async function update(req, res) {
  const { id } = req.params;
  // Apenas o admin padrão (admin@spsgroup.com.br) não pode ser alterado; outros admins podem alterar o próprio cargo (ex.: admin → user).
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, ERROR_KEYS.USERS_ADMIN_CANNOT_BE_UPDATED);
  }
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }
  const existing = userRepository.findByIdWithPassword(id);
  if (!existing) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }
  const updates = { ...parsed.data };
  if (updates.type === "admin" && req.user.type !== "admin") {
    return sendError(res, 403, ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
  }
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }
  if (updates.email && userRepository.emailExists(updates.email, id)) {
    return sendError(res, 409, ERROR_KEYS.AUTH_EMAIL_TAKEN);
  }
  const toStore = {};
  if (updates.name !== undefined) toStore.name = updates.name;
  if (updates.email !== undefined) toStore.email = updates.email;
  if (updates.type !== undefined) toStore.type = updates.type;
  if (updates.passwordHash !== undefined) toStore.passwordHash = updates.passwordHash;
  const user = userRepository.update(id, toStore);
  res.json({ data: user });
}

async function remove(req, res) {
  const { id } = req.params;
  if (id === req.user.id) {
    return sendError(res, 403, ERROR_KEYS.USERS_CANNOT_DELETE_SELF);
  }
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, ERROR_KEYS.USERS_ADMIN_CANNOT_BE_DELETED);
  }
  const existed = userRepository.remove(id);
  if (!existed) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }
  res.status(200).json({ message: ERROR_KEYS.USERS_DELETED });
}

module.exports = { list, getById, create, update, remove };
