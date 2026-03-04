----------------------------------
ESPANHOL
----------------------------------

## PRUEBA SPS REACT

- Crear un CRUD de usuarios

## Reglas

- Crear la página de inicio de sesión (signIn) para autenticar al usuario (usar el usuario previamente registrado para validar).
- Se puede utilizar cualquier tipo de almacenamiento para guardar el token.
- Solo será posible registrar y/o visualizar usuarios si el usuario está autenticado.
- Consumir la API creada anteriormente (test-sps-server).


----------------------------------
PORTUGUÊS
----------------------------------

# SPS REACT TEST

- Criar um CRUD de usuários

# Regras

- Criar a página de signIn para fazer a autenticação do usuário (Usar o usuário previamente cadastrado para validar)
- Pode usar qualquer tipo de storage para guardar o token
- Só será possível cadastrar e/ou visualizar os usuários se estiver autenticado
- Chamar a API que foi criada anteriormente (test-sps-server)

## Desenvolvimento (Vite)

O frontend usa [Vite](https://vitejs.dev/) para dev e build.

- **`npm run dev`** ou **`npm start`** — servidor de desenvolvimento (porta 3000)
- **`npm run build`** — build de produção em `dist/`
- **`npm run preview`** — preview do build de produção

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do frontend (copie de `.env.example`). Variáveis expostas ao app devem ter o prefixo **`VITE_`**:

- `VITE_SERVER_URL` — URL base da API (ex.: `http://localhost:4000`)
