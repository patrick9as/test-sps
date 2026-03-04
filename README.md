# Projeto SPS (Backend + Frontend)

Este repositório contém o **backend** (Node/Express) e o **frontend** (React/Vite) do projeto: API REST de usuários com autenticação JWT e aplicação web com CRUD, login e listagem. Na raiz existem scripts para instalar dependências e rodar os dois ao mesmo tempo.

**A aplicação pode rodar de duas formas:** com **dados em memória** (sem banco, ideal para desenvolvimento rápido) ou com **PostgreSQL** (dados persistidos em banco, via Docker). Você escolhe o modo na hora de subir o projeto; ambos estão disponíveis e documentados abaixo.

## Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **npm**
- **Docker** (apenas se for rodar no modo PostgreSQL; para o modo em memória não é necessário)

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
   | `STORAGE`        | Não         | `memory` (padrão) ou `postgres`. Define onde os dados são persistidos |
   | `PG_HOST`        | Se `STORAGE=postgres` | Host do PostgreSQL (ex.: `localhost`) |
   | `PG_PORT`        | Se `STORAGE=postgres` | Porta do PostgreSQL (ex.: `5433`) |
   | `PG_USER`        | Se `STORAGE=postgres` | Usuário do banco |
   | `PG_PASSWORD`    | Se `STORAGE=postgres` | Senha do banco |
   | `PG_DATABASE`    | Se `STORAGE=postgres` | Nome do banco (ex.: `SPS_TEST`) |

   Exemplo (só memória):
   ```
   PORT=3000
   JWT_SECRET=uma_chave_secreta_forte_aqui
   JWT_EXPIRES_IN=24h
   STORAGE=memory
   ```

   Exemplo (com PostgreSQL): use também as variáveis `PG_*` conforme o `backend/.env.example`.

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

## 3. Rodar o projeto (dois modos)

A aplicação tem **dois modos de execução**. Escolha um:

---

### Modo 1: Dados em memória

- **O que é:** o backend guarda usuários em memória (RAM). Nada é gravado em banco; ao reiniciar o servidor, os dados são perdidos (exceto o usuário admin padrão, que é recriado na subida).
- **Quando usar:** desenvolvimento rápido, testes, quando não precisa de persistência.
- **Como rodar** (na raiz do projeto):

  ```bash
  npm run dev:memory
  ```

  Ou simplesmente `npm run dev` (o padrão é memória).

- **Requisitos:** só o `backend/.env` com `PORT`, `JWT_SECRET` e, se quiser explícito, `STORAGE=memory`. Não precisa de Docker nem PostgreSQL.

---

### Modo 2: PostgreSQL (dados persistidos)

- **O que é:** o backend usa um banco PostgreSQL. Os dados ficam gravados no disco (volume Docker) e permanecem após reiniciar.
- **Quando usar:** quando quiser persistência, testar com banco real ou simular ambiente mais próximo de produção.
- **Como rodar:**

  1. **Subir o Postgres primeiro** (obrigatório). Na raiz do projeto, em um terminal:

     ```bash
     npm run docker:up
     ```

     Ou use **`npm run docker:up:d`** para rodar o Postgres em background (recomendado: fica desacoplado do terminal e você pode rodar os próximos comandos no mesmo terminal).

  2. **Depois**, em outro terminal (ou no mesmo, se usou `docker:up:d`), subir a aplicação em modo Postgres:

     ```bash
     npm run dev:postgres
     ```

- **Requisitos:** Docker instalado; `backend/.env` com `STORAGE=postgres` e as variáveis `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` (conforme `backend/.env.example`). Na primeira subida o backend aplica as migrations e cria o usuário admin padrão. O `docker-compose.yml` fica em **`backend/`** e lê essas variáveis do próprio `backend/.env`; defina `PG_PASSWORD` (e as demais) apenas no seu `.env` local, sem commitar.

**Resumo:** para rodar com Postgres, **sempre execute o comando do compose antes** de rodar `npm run dev:postgres`. Na raiz, `npm run docker:up` (ou `docker:up:d`) delega para o backend, onde o compose é executado.

---

### O que sobe em ambos os modos

Em qualquer um dos modos acima, sobem em paralelo:

- **Backend** — API na porta definida em `backend/.env` (ex.: `http://localhost:3000`)
- **Frontend** — Vite em `http://localhost:5173`

### Rodar apenas backend ou frontend

- Só o backend: `npm run dev:backend`
- Só o frontend: `npm run dev:frontend`

## API (backend)

- **Único endpoint público:** `POST /login`. Demais rotas exigem header `Authorization: Bearer <token>`.
- **Health:** `GET /health` — retorna `{ "data": { "status": "ok" } }`.
- **Usuários:** `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` (todos com auth).
- Respostas de sucesso com dados usam `{ "data": ... }`; erros usam `{ "error": "chave_i18n" }` para o frontend traduzir.
- **Rate limit:** 100 req/15 min global; login: 5 tentativas (falhas) por 15 min.

## Collection Postman (API)

Há uma collection do Postman para testar a API do backend em **`backend/SPS Test.postman_collection.json`**.

**Como usar:**

1. Abra o [Postman](https://www.postman.com/) e importe o arquivo: *Import* → escolha `backend/SPS Test.postman_collection.json`.
2. Configure a variável de ambiente da collection:
   - **`base_url`** — URL base da API (ex.: `http://localhost:3000`), igual à `PORT` do seu `backend/.env`.
3. As rotas de usuários exigem autenticação. Faça primeiro **POST /login** (na pasta da collection) com um usuário válido; em seguida, na collection ou no ambiente, defina o header **`Authorization`** como `Bearer <token>` (o token vem na resposta do login). No Postman você pode usar um script de teste no login para salvar o token em variável e um auth do tipo Bearer Token com essa variável.
4. A collection inclui exemplos de **login**, **users** (listar, obter por id, criar, editar, excluir). A requisição "post new user" grava o `user_id` retornado em variável para usar em get/put/delete por id.

Com o backend rodando (`npm run dev:backend` ou `npm run dev`), use a collection para chamar os endpoints sem depender do frontend.

## Frontend (Vite)

- **`npm run dev`** / **`npm start`** — servidor de desenvolvimento (na pasta `frontend` ou via `npm run dev:frontend` na raiz).
- **`npm run build`** — build de produção em `frontend/dist/`.
- **`npm run preview`** — preview do build (na pasta `frontend`).

## Testes unitários (Jest – backend)

Os testes unitários do backend usam **Jest** (e **Supertest** para as rotas). Rodam na pasta `backend` e **não exigem** o servidor em execução.

**Rodar os testes** (na pasta `backend`):

- **Uma execução:** `npm test`
- **Modo watch (re-executa ao salvar):** `npm run test:watch`

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

## Resumo de comandos

| Comando               | Onde      | O que faz                                                |
|-----------------------|-----------|----------------------------------------------------------|
| `npm run install:all` | raiz      | Instala dependências da raiz, do backend e do frontend   |
| **Modo memória**      |           |                                                          |
| `npm run dev`         | raiz      | Sobe backend e frontend (**dados em memória**, padrão)   |
| `npm run dev:memory`  | raiz      | Idem: backend e frontend com **dados em memória**        |
| **Modo Postgres**     |           |                                                          |
| `npm run docker:up`   | raiz      | Sobe o Postgres (primeiro plano; porta 5433). Rode **antes** de `dev:postgres` |
| `npm run docker:up:d` | raiz      | Sobe o Postgres em background (recomendado: desacopla do terminal para rodar os próximos comandos no mesmo) |
| `npm run dev:postgres`| raiz      | Sobe backend e frontend com **PostgreSQL** (Postgres já deve estar no ar) |
| **Testes**            |           |                                                          |
| `npm test`            | backend   | Roda os testes unitários (Jest) do backend (na pasta `backend`) |
| `npm run test:watch`  | backend   | Jest em modo watch (na pasta `backend`)                  |
| `npm run cy:run`      | frontend  | Roda os testes E2E Cypress em modo headless (na pasta `frontend`) |
| `npm run cy:run:headed` | frontend | Roda os testes E2E Cypress com navegador visível (Chrome; na pasta `frontend`) |
