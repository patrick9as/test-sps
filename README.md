# Projeto SPS (Backend + Frontend)

Este repositório contém o **backend** (Node/Express) e o **frontend** (React/Vite) do projeto: API REST de usuários com autenticação JWT e aplicação web com CRUD, login e listagem. Na raiz existem scripts para instalar dependências e rodar os dois ao mesmo tempo.

## Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **npm**

## 1. Instalar dependências

Na **raiz do projeto**, rode:

```bash
npm run install:all
```

Esse comando:

1. Instala as dependências da raiz (incluindo `concurrently`)
2. Instala as dependências do **backend**
3. Instala as dependências do **frontend**

Tudo em uma única execução.

## 2. Configuração dos arquivos .env (obrigatório antes de rodar)

Antes de executar `npm run dev`, é necessário configurar as variáveis de ambiente em **dois arquivos `.env`** (um no backend e outro no frontend). Eles **não vêm versionados** no repositório por segurança; use os `.env.example` como modelo.

### Backend (`backend/.env`)

1. Copie o arquivo de exemplo para criar o `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Edite `backend/.env` e preencha:

   | Variável        | Obrigatório | Descrição |
   |------------------|-------------|-----------|
   | `PORT`           | Sim         | Porta em que a API sobe (ex.: `3000`) |
   | `JWT_SECRET`     | Sim         | Chave secreta para assinar os tokens JWT (use um valor forte em produção) |
   | `JWT_EXPIRES_IN` | Não         | Validade do token (ex.: `24h`, `7d`). Se omitido, o padrão é `24h` |

   Exemplo:
   ```
   PORT=3000
   JWT_SECRET=uma_chave_secreta_forte_aqui
   JWT_EXPIRES_IN=24h
   ```

### Frontend (`frontend/.env`)

1. Copie o arquivo de exemplo:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. Edite `frontend/.env`. No Vite, só variáveis com prefixo **`VITE_`** são expostas ao app:

   | Variável           | Obrigatório | Descrição |
   |--------------------|-------------|-----------|
   | `VITE_SERVER_URL`  | Sim         | URL base da API (ex.: `http://localhost:3000`). Deve bater com a `PORT` do backend. |

   Exemplo:
   ```
   VITE_SERVER_URL=http://localhost:3000
   ```

**Resumo:** sem `backend/.env` (com `PORT` e `JWT_SECRET`) o servidor não inicia; sem `frontend/.env` (com `VITE_SERVER_URL`) o frontend não conseguirá chamar a API corretamente.

## 3. Rodar o projeto

Ainda na **raiz do projeto**, rode:

```bash
npm run dev
```

Isso sobe em paralelo:

- **Backend** — API na porta definida em `backend/.env` (ex.: `http://localhost:3000`)
- **Frontend** — Vite em `http://localhost:5173`

### Rodar apenas um dos dois

- Só o backend: `npm run dev:backend`
- Só o frontend: `npm run dev:frontend`

## Resumo de comandos

| Comando               | O que faz                                                |
|-----------------------|----------------------------------------------------------|
| `npm run install:all` | Instala dependências da raiz, do backend e do frontend   |
| `npm run dev`         | Sobe backend e frontend em paralelo                     |
| `npm run dev:backend` | Sobe só o backend                                       |
| `npm run dev:frontend`| Sobe só o frontend                                      |

## API (backend)

- **Único endpoint público:** `POST /login`. Demais rotas exigem header `Authorization: Bearer <token>`.
- **Health:** `GET /health` — retorna `{ "data": { "status": "ok" } }`.
- **Usuários:** `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` (todos com auth).
- Respostas de sucesso com dados usam `{ "data": ... }`; erros usam `{ "error": "chave_i18n" }` para o frontend traduzir.
- **Rate limit:** 100 req/15 min global; login: 5 tentativas (falhas) por 15 min.

## Frontend (Vite)

- **`npm run dev`** / **`npm start`** — servidor de desenvolvimento (na pasta `frontend` ou via `npm run dev:frontend` na raiz).
- **`npm run build`** — build de produção em `frontend/dist/`.
- **`npm run preview`** — preview do build (na pasta `frontend`).

## Testes E2E (Cypress)

Os testes E2E do frontend usam **Cypress** e rodam contra o app real (backend e frontend precisam estar em execução).

1. **Subir backend e frontend** (na raiz):
   ```bash
   npm run dev
   ```
2. **Rodar os testes** (na pasta `frontend`):
   - **Headless (CI):** `npm run cy:run`
   - **Com navegador visível (Chrome):** `npm run cy:run:headed`

Certifique-se de que o `frontend/.env` está configurado com `VITE_SERVER_URL` apontando para a URL do backend (ex.: `http://localhost:3000`), pois o app usa essa URL para as chamadas de API durante os testes.
