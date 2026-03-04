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

## 2. Configuração

### Backend

- Copie `backend/.env.example` para `backend/.env` e defina:
  - **`PORT`** — porta do servidor (ex.: `4000`)
  - **`JWT_SECRET`** — segredo para assinar o token
  - **`JWT_EXPIRES_IN`** (opcional) — validade do token (ex.: `7d`)

### Frontend

- Crie `frontend/.env` (copie de `frontend/.env.example` se existir). Variáveis expostas ao app devem ter o prefixo **`VITE_`**:
  - **`VITE_SERVER_URL`** — URL base da API (ex.: `http://localhost:4000`)

## 3. Rodar o projeto

Ainda na **raiz do projeto**, rode:

```bash
npm run dev
```

Isso sobe em paralelo:

- **Backend** — API na porta definida em `backend/.env` (ex.: `http://localhost:4000`)
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
