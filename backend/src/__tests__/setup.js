process.env.NODE_ENV = "test";
process.env.STORAGE = "memory";
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-for-jest";
}
if (!process.env.PORT) {
  process.env.PORT = "3000";
}

const userRepository = require("../repositories/user.repository");

userRepository.clearStore();

beforeAll(async () => {
  await userRepository.ensureDefaultAdmin();
});
