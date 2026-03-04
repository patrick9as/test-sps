require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");
const { ERROR_KEYS } = require("./config/constants");
const routes = require("./routes");

const app = express();

// OpenAPI spec para Swagger (carregada antes das rotas)
const openapiPath = path.join(__dirname, "docs", "openapi.yaml");
const openapiSpec = yaml.load(fs.readFileSync(openapiPath, "utf8"));

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Documentação Swagger: UI em /api-docs, spec bruta em /api-docs.json
app.get("/api-docs.json", (_, res) => res.json(openapiSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(routes);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(500).json({ error: ERROR_KEYS.INTERNAL_SERVER_ERROR });
});

module.exports = app;
