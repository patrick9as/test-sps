const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const knex = require("../db/knex");
const { ADMIN_EMAIL, DEFAULT_ADMIN_ID } = require("../config/constants");

const DEFAULT_ADMIN_PASSWORD_PLAIN = "1234";

/**
 * @param {object} row - row with password_hash
 * @returns {object} user with passwordHash (camelCase)
 */
function fromRow(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return { ...rest, passwordHash: password_hash };
}

/**
 * @param {object} user
 * @returns {{ id: string; name: string; email: string; type: string }}
 */
function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

async function findAll() {
  const rows = await knex("users").select("*");
  return rows.map((r) => toPublic(fromRow(r)));
}

/**
 * @param {string} id
 */
async function findById(id) {
  const row = await knex("users").where({ id }).first();
  return row ? toPublic(fromRow(row)) : null;
}

/**
 * @param {string} email
 */
async function findByEmail(email) {
  const row = await knex("users").where({ email }).first();
  return row ? toPublic(fromRow(row)) : null;
}

/**
 * @param {string} id
 */
async function findByIdWithPassword(id) {
  const row = await knex("users").where({ id }).first();
  return row ? fromRow(row) : null;
}

/**
 * @param {string} email
 */
async function findByEmailWithPassword(email) {
  const row = await knex("users").where({ email }).first();
  return row ? fromRow(row) : null;
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
  return id === DEFAULT_ADMIN_ID;
}

/**
 * Garante que o usuário admin padrão existe (não excluível/inalterável).
 */
async function ensureDefaultAdmin() {
  const existing = await knex("users").where({ email: ADMIN_EMAIL }).first();
  if (existing) return toPublic(fromRow(existing));

  const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD_PLAIN, 10);
  await knex("users").insert({
    id: DEFAULT_ADMIN_ID,
    name: "admin",
    email: ADMIN_EMAIL,
    type: "admin",
    password_hash: passwordHash,
  });
  return toPublic({
    id: DEFAULT_ADMIN_ID,
    name: "admin",
    email: ADMIN_EMAIL,
    type: "admin",
    passwordHash,
  });
}

/**
 * @param {{ name: string; email: string; type: string; passwordHash: string }} data
 */
async function create(data) {
  const id = nanoid();
  await knex("users").insert({
    id,
    name: data.name,
    email: data.email,
    type: data.type,
    password_hash: data.passwordHash,
  });
  return toPublic({ id, ...data });
}

/**
 * @param {string} id
 * @param {{ name?: string; email?: string; type?: string; passwordHash?: string }} data
 */
async function update(id, data) {
  if (id === DEFAULT_ADMIN_ID) return null;
  const row = await knex("users").where({ id }).first();
  if (!row) return null;

  const toUpdate = {};
  if (data.name !== undefined) toUpdate.name = data.name;
  if (data.email !== undefined) toUpdate.email = data.email;
  if (data.type !== undefined) toUpdate.type = data.type;
  if (data.passwordHash !== undefined) toUpdate.password_hash = data.passwordHash;
  toUpdate.updated_at = knex.fn.now();

  await knex("users").where({ id }).update(toUpdate);
  const updated = await knex("users").where({ id }).first();
  return updated ? toPublic(fromRow(updated)) : null;
}

/**
 * @param {string} id
 */
async function remove(id) {
  if (id === DEFAULT_ADMIN_ID) return false;
  const deleted = await knex("users").where({ id }).del();
  return deleted > 0;
}

/**
 * @param {string} email
 * @param {string} [excludeId]
 */
async function emailExists(email, excludeId) {
  const q = knex("users").where({ email });
  if (excludeId) q.andWhere("id", "!=", excludeId);
  const row = await q.first();
  return !!row;
}

/**
 * No-op em PostgreSQL (uso em testes com STORAGE=memory).
 */
function clearStore() {
  // no-op; testes usam STORAGE=memory
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
  setProfilePicture: async () => null,
  getProfilePicture: async () => null,
  remove,
  emailExists,
  clearStore,
};
