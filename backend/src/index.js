require("dotenv").config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  handler: (req, res) => {
    const info = req.rateLimit || {};
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
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(500).json({ error: "internal.server_error" });
});

userRepository.ensureDefaultAdmin();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
