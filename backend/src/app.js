require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ERROR_KEYS } = require("./config/constants");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(500).json({ error: ERROR_KEYS.INTERNAL_SERVER_ERROR });
});

module.exports = app;
