const storage = process.env.STORAGE || "memory";

if (storage === "postgres") {
  module.exports = require("./attachment.repository.pg");
} else {
  module.exports = require("./attachment.repository.memory");
}

