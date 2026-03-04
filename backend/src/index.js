require("dotenv").config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
  console.error("Missing required env: PORT and JWT_SECRET must be set.");
  process.exit(1);
}

const app = require("./app");
const userRepository = require("./repositories/user.repository");

async function start() {
  if (process.env.STORAGE === "postgres") {
    const knex = require("./db/knex");
    await knex.migrate.latest();
  }
  await userRepository.ensureDefaultAdmin();

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
