process.env.NODE_ENV = "test";
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-for-jest";
}
if (!process.env.PORT) {
  process.env.PORT = "3000";
}

const userRepository = require("../repositories/user.repository");

userRepository.clearStore();
userRepository.ensureDefaultAdmin();
