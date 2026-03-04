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
  return Promise.resolve(Array.from(store.values()).map(toPublic));
}

/**
 * @param {string} id
 */
function findById(id) {
  const user = store.get(id);
  return Promise.resolve(user ? toPublic(user) : null);
}

/**
 * @param {string} email
 */
function findByEmail(email) {
  const found = Array.from(store.values()).find((u) => u.email === email);
  return Promise.resolve(found ? toPublic(found) : null);
}

/**
 * @param {string} id
 */
function findByIdWithPassword(id) {
  return Promise.resolve(store.get(id) || null);
}

/**
 * @param {string} email
 */
function findByEmailWithPassword(email) {
  const found = Array.from(store.values()).find((u) => u.email === email);
  return Promise.resolve(found || null);
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
  if (existing) return Promise.resolve(toPublic(existing));
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
  return Promise.resolve(toPublic(admin));
}

/**
 * @param {{ name: string; email: string; type: string; passwordHash: string }} data
 */
function create(data) {
  const id = nanoid();
  const user = { id, ...data };
  store.set(id, user);
  return Promise.resolve(toPublic(user));
}

/**
 * @param {string} id
 * @param {{ name?: string; email?: string; type?: string; passwordHash?: string }} data
 */
function update(id, data) {
  const user = store.get(id);
  if (!user) return Promise.resolve(null);
  if (user.email === ADMIN_EMAIL) return Promise.resolve(null); // imutável
  Object.assign(user, data);
  return Promise.resolve(toPublic(user));
}

/**
 * @param {string} id
 */
function remove(id) {
  const user = store.get(id);
  if (!user) return Promise.resolve(false);
  if (user.email === ADMIN_EMAIL) return Promise.resolve(false); // não pode excluir
  return Promise.resolve(store.delete(id));
}

/**
 * Verifica se email já existe em outro usuário (excluindo id se informado).
 * @param {string} email
 * @param {string} [excludeId]
 */
function emailExists(email, excludeId) {
  const found =
    Array.from(store.values()).find((u) => u.email === email && u.id !== excludeId);
  return Promise.resolve(!!found);
}

/**
 * Esvazia o store em memória. Apenas para uso em testes (isolamento entre testes).
 */
function clearStore() {
  store.clear();
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
  clearStore,
};
