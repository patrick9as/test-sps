require("dotenv").config();

const ADMIN_EMAIL = "admin@spsgroup.com.br";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return secret;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "24h";

module.exports = {
  ADMIN_EMAIL,
  getJwtSecret,
  getJwtExpiresIn,
};
