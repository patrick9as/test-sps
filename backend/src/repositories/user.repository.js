const storage = process.env.STORAGE || "memory";

if (storage === "postgres") {
  module.exports = require("./user.repository.pg");
} else {
  module.exports = require("./user.repository.memory");
}
