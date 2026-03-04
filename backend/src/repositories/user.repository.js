const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const { ADMIN_EMAIL } = require("../config/constants");

const DEFAULT_ADMIN_PASSWORD_PLAIN = "1234";

/** @type {Map<string, { id: string; name: string; email: string; type: string; passwordHash: string }>} */
// Armazena os usuários em um Map
const store = new Map();

/**
 * @param {object} user
 * @returns {{ id: string; name: string; email: string; type: string }}
 */
function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function findAll() {
  return Array.from(store.values()).map(toPublic);
}

/**
 * @param {string} id
 */
function findById(id) {
  const user = store.get(id);
  return user ? toPublic(user) : null;
}

/**
 * @param {string} email
 */
function findByEmail(email) {
  const found = Array.from(store.values()).find((u) => u.email === email);
  return found || null;
}

/**
 * @param {string} id
 */
function findByIdWithPassword(id) {
  return store.get(id) || null;
}

/**
 * @param {string} email
 */
function findByEmailWithPassword(email) {
  const found = Array.from(store.values()).find((u) => u.email === email);
  return found || null;
}

/**
 * @param {string} email
 */
function isDefaultAdminEmail(email) {
  return email === ADMIN_EMAIL;
}

/**
 * @param {string} id
 */
function isDefaultAdminId(id) {
  const user = store.get(id);
  return user ? user.email === ADMIN_EMAIL : false;
}

/**
 * Garante que o usuário admin padrão existe (não excluível/inalterável).
 */
function ensureDefaultAdmin() {
  const existing = Array.from(store.values()).find((u) => u.email === ADMIN_EMAIL);
  if (existing) return toPublic(existing);
  const id = nanoid();
  const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD_PLAIN, 10);
  const admin = {
    id,
    name: "admin",
    email: ADMIN_EMAIL,
    type: "admin",
    passwordHash,
  };
  store.set(id, admin);
  return toPublic(admin);
}

/**
 * @param {{ name: string; email: string; type: string; passwordHash: string }} data
 */
function create(data) {
  const id = nanoid();
  const user = { id, ...data };
  store.set(id, user);
  return toPublic(user);
}

/**
 * @param {string} id
 * @param {{ name?: string; email?: string; type?: string; passwordHash?: string }} data
 */
function update(id, data) {
  const user = store.get(id);
  if (!user) return null;
  if (user.email === ADMIN_EMAIL) return null; // imutável
  Object.assign(user, data);
  return toPublic(user);
}

/**
 * @param {string} id
 */
function remove(id) {
  const user = store.get(id);
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return false; // não pode excluir
  return store.delete(id);
}

/**
 * Verifica se email já existe em outro usuário (excluindo id se informado).
 * @param {string} email
 * @param {string} [excludeId]
 */
function emailExists(email, excludeId) {
  const found = 
  
    Array
      .from(store.values())
      .find((u) => u.email === email && u.id !== excludeId);

  return !!found;
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByIdWithPassword,
  findByEmailWithPassword,
  isDefaultAdminEmail,
  isDefaultAdminId,
  ensureDefaultAdmin,
  create,
  update,
  remove,
  emailExists,
};
