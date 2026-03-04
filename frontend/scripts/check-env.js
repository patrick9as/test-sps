/**
 * Verifica se VITE_SERVER_URL está definido no .env antes de subir o dev server.
 * Uso: node scripts/check-env.js && vite
 */
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
  console.error(
    "[frontend] Arquivo .env não encontrado. Copie o .env.example para .env e defina VITE_SERVER_URL."
  );
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");
const match = content.match(/^\s*VITE_SERVER_URL\s*=\s*(.*)/m);
const value = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";

if (!value) {
  console.error(
    "[frontend] VITE_SERVER_URL deve estar definido no .env (ex.: VITE_SERVER_URL=http://localhost:3000)."
  );
  process.exit(1);
}
