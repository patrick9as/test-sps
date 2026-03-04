const bcrypt = require("bcryptjs");
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
    return sendError(res, 404, "users.not_found");
  }
  res.json({ data: user });
}

async function create(req, res) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "validation.invalid_body", {
      data: formatZodErrors(parsed.error),
    });
  }
  const { name, email, type, password } = parsed.data;
  if (type === "admin" && req.user.type !== "admin") {
    return sendError(res, 403, "users.only_admin_can_create_admin");
  }
  if (userRepository.emailExists(email)) {
    return sendError(res, 409, "auth.email_taken");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepository.create({ name, email, type, passwordHash });
  res.status(201).json({ data: user });
}

async function update(req, res) {
  const { id } = req.params;
  // Apenas o admin padrão (admin@spsgroup.com.br) não pode ser alterado; outros admins podem alterar o próprio cargo (ex.: admin → user).
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, "users.admin_cannot_be_updated");
  }
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "validation.invalid_body", {
      data: formatZodErrors(parsed.error),
    });
  }
  const existing = userRepository.findByIdWithPassword(id);
  if (!existing) {
    return sendError(res, 404, "users.not_found");
  }
  const updates = { ...parsed.data };
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }
  if (updates.email && userRepository.emailExists(updates.email, id)) {
    return sendError(res, 409, "auth.email_taken");
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
    return sendError(res, 403, "users.cannot_delete_self");
  }
  if (userRepository.isDefaultAdminId(id)) {
    return sendError(res, 403, "users.admin_cannot_be_deleted");
  }
  const existed = userRepository.remove(id);
  if (!existed) {
    return sendError(res, 404, "users.not_found");
  }
  res.status(200).json({ message: "users.deleted" });
}

module.exports = { list, getById, create, update, remove };
