require("dotenv").config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
  // Verifica se as variáveis de ambiente necessárias estão definidas
  console.error("Missing required env: PORT and JWT_SECRET must be set.");
  process.exit(1);
}

const express = require("express");
const cors = require("cors"); // Middleware para segurança de CORS
const helmet = require("helmet"); // Middleware para segurança
const morgan = require("morgan"); // Middleware para logging
const { ERROR_KEYS } = require("./config/constants");
const routes = require("./routes");
const userRepository = require("./repositories/user.repository");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err, req, res, next) => {
  // Verifica se o ambiente de produção não está ativo para não exibir erros sensíveis
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  // Define o status 500 e retorna o erro interno do servidor
  res.status(500).json({ error: ERROR_KEYS.INTERNAL_SERVER_ERROR });
});

userRepository.ensureDefaultAdmin();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
