require("dotenv").config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
  // Verifica se as variáveis de ambiente necessárias estão definidas
  console.error("Missing required env: PORT and JWT_SECRET must be set.");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const userRepository = require("./repositories/user.repository");

const app = express();

app.use(helmet());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Define o tempo de janela de 15 minutos para novas requisições
  max: 100, // Define o número máximo de requisições permitidas
  standardHeaders: true, // Define se os headers padrão devem ser usados
  handler: (req, res) => {
    // Obtém as informações da requisição de rate limit
    const info = req.rateLimit || {};

    // Define o timestamp de reset da janela de rate limit
    const resetAt = 
      info.resetTime instanceof Date
        ? Math.floor(info.resetTime.getTime() / 1000)
        : info.resetTime;
    res.status(429).json({
      error: "rate_limit.exceeded",
      remaining: info.remaining ?? 0,
      limit: info.limit ?? 100,
      resetAt,
    });
  },
});
app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err, req, res, next) => {
  // Verifica se o ambiente de produção não está ativo para não exibir erros sensíveis
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  // Define o status 500 e retorna o erro interno do servidor
  res.status(500).json({ error: "internal.server_error" });
});

userRepository.ensureDefaultAdmin();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
