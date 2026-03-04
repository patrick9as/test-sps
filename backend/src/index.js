require("dotenv").config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
  console.error("Missing required env: PORT and JWT_SECRET must be set.");
  process.exit(1);
}

const app = require("./app");
const userRepository = require("./repositories/user.repository");

userRepository.ensureDefaultAdmin();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
