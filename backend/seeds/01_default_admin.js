const bcrypt = require("bcryptjs");
const { ADMIN_EMAIL, DEFAULT_ADMIN_ID } = require("../src/config/constants");

const DEFAULT_ADMIN_PASSWORD_PLAIN = "1234";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const existing = await knex("users").where({ email: ADMIN_EMAIL }).first();
  if (existing) return;

  const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD_PLAIN, 10);
  await knex("users").insert({
    id: DEFAULT_ADMIN_ID,
    name: "admin",
    email: ADMIN_EMAIL,
    type: "admin",
    password_hash: passwordHash,
  });
};
