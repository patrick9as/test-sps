----------------------------------
ESPANHOL
----------------------------------

## Prueba NODE

- Crear un CRUD (API REST) en Node para el registro de usuarios.
- Para la creación de la prueba, utilizar un repositorio falso de usuarios (puede ser en memoria).

## Reglas

- Debe existir un usuario administrador previamente registrado para utilizar la autenticación (no es necesario cifrar la contraseña):
{
  "name": "admin",
  "email": "admin@spsgroup.com.br",
  "type": "admin",
  "password": "1234"
}

- Crear una ruta de autenticación (token Jwt).
- Las rutas de la API solo pueden ser ejecutadas si el usuario está autenticado.
- Debe ser posible añadir usuarios con los campos: email, nombre, type, password.
- No debe ser posible registrar un correo electrónico ya existente.
- Debe ser posible eliminar usuarios.
- Debe ser posible modificar los datos de un usuario.


----------------------------------
PORTUGUÊS
----------------------------------

# Teste NODE

- Criar um CRUD (API REST) em node para cadastro de usuários
- Para a criação do teste utilizar um repositório fake dos usuários. (Pode ser em memória)

## Regras

- Deve existir um usuário admin previamente cadastrado para utilizar autenticação (não precisa criptografar a senha);
  {
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin"
    password: "1234"
  }

- Crear rota de autenticação (Jwt token)
- As rotas da API só podem ser executadas se estiver autenticada
- Deve ser possível adicionar usuários. Campos: email, nome, type, password
- Não deve ser possível cadastrar o e-mail já cadastrado
- Deve ser possível remover usuário
- Deve ser possível alterar os dados do usuário

---

## API (test-sps-server)

### Configuração

- Copie `.env.example` para `.env` e defina `PORT`, `JWT_SECRET` e opcionalmente `JWT_EXPIRES_IN`.
- Único endpoint **público**: `POST /login`. Todas as demais rotas exigem header `Authorization: Bearer <token>`.

### Endpoints

| Método   | Rota        | Auth | Descrição                          |
|----------|-------------|------|------------------------------------|
| GET      | /health     | Não  | Health check. Resposta: `{ "data": { "status": "ok" } }` |
| POST     | /login      | Não  | Body: `{ "email", "password" }`. Resposta: `{ "data": { "token": "..." } }` |
| GET      | /users      | Sim  | Lista usuários. Resposta: `{ "data": [ { "id", "name", "email", "type" }, ... ] }` |
| GET      | /users/:id  | Sim  | Um usuário. Resposta: `{ "data": { "id", "name", "email", "type" } }` |
| POST     | /users      | Sim  | Criar usuário. Body: `{ "name", "email", "type", "password" }`. Resposta: `{ "data": { ... } }` |
| PUT      | /users/:id  | Sim  | Atualizar (próprio usuário ou outro se for admin). Admin padrão não pode ser alterado. |
| DELETE   | /users/:id  | Sim  | Excluir (próprio usuário ou outro se for admin). Admin padrão não pode ser excluído. |

### Erros (i18n)

Todas as respostas de erro usam chaves para o frontend traduzir:

- Formato: `{ "error": "chave" }`. Em validação: `{ "error": "validation.invalid_body", "errors": [ { "path", "message" }, ... ] }`.
- Chaves: `auth.invalid_credentials`, `auth.invalid_token`, `auth.forbidden`, `auth.email_taken`, `users.not_found`, `users.admin_cannot_be_deleted`, `users.admin_cannot_be_updated`, `users.only_admin_can_create_admin`, `validation.invalid_body`, `rate_limit.exceeded`, `internal.server_error`.

### Rate limit

- Headers em todas as respostas: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.
- Ao exceder (429): corpo com `error`, `remaining`, `limit`, `resetAt`.
