require("dotenv").config();

// Usuário admin padrão (não excluível / não alterável)
const ADMIN_EMAIL = "admin@spsgroup.com.br";
const DEFAULT_ADMIN_ID = "default-admin";

// Chaves de erro/mensagem para i18n (frontend).
const ERROR_KEYS = {
  AUTH_INVALID_CREDENTIALS: "auth.invalid_credentials",
  AUTH_INVALID_TOKEN: "auth.invalid_token",
  AUTH_FORBIDDEN: "auth.forbidden",
  AUTH_EMAIL_TAKEN: "auth.email_taken",
  USERS_NOT_FOUND: "users.not_found",
  USERS_DELETED: "users.deleted",
  USERS_CANNOT_DELETE_SELF: "users.cannot_delete_self",
  USERS_ONLY_ADMIN_CAN_MODIFY_OTHERS: "users.only_admin_can_modify_others",
  USERS_DEFAULT_USER_CANNOT_BE_MODIFIED: "users.default_user_cannot_be_modified",
  USERS_DEFAULT_USER_CANNOT_BE_DELETED: "users.default_user_cannot_be_deleted",
  USERS_ONLY_ADMIN_CAN_CREATE_ADMIN: "users.only_admin_can_create_admin",
  VALIDATION_INVALID_BODY: "validation.invalid_body",
  VALIDATION_PASSWORD_MIN_LENGTH: "validation.password_min_length",
  VALIDATION_PASSWORD_UPPERCASE: "validation.password_uppercase",
  VALIDATION_PASSWORD_NUMBER: "validation.password_number",
  VALIDATION_PASSWORD_SPECIAL: "validation.password_special",
  RATE_LIMIT_EXCEEDED: "rate_limit.exceeded",
  INTERNAL_SERVER_ERROR: "internal.server_error",
};

// Configurações do JWT
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return secret;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "24h";

module.exports = {
  ADMIN_EMAIL,
  DEFAULT_ADMIN_ID,
  ERROR_KEYS,
  getJwtSecret,
  getJwtExpiresIn,
};
