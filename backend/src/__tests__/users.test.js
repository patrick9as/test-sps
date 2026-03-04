const request = require("supertest");
const app = require("../app");
const { ERROR_KEYS } = require("../config/constants");

const validPassword = "Senha123!";

async function loginAsAdmin() {
  const res = await request(app)
    .post("/login")
    .send({ email: "admin@spsgroup.com.br", password: "1234" });
  expect(res.status).toBe(200);
  return res.body.data.token;
}

async function createUserAndGetToken(adminToken, userPayload = {}) {
  const payload = {
    name: "User Test",
    email: `user-${Date.now()}@test.com`,
    type: "user",
    password: validPassword,
    ...userPayload,
  };
  const createRes = await request(app)
    .post("/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(payload);
  expect(createRes.status).toBe(201);
  const { email } = createRes.body.data;
  const loginRes = await request(app)
    .post("/login")
    .send({ email, password: payload.password });
  expect(loginRes.status).toBe(200);
  return { token: loginRes.body.data.token, user: createRes.body.data };
}

describe("CRUD de usuários", () => {
  describe("autenticação", () => {
    it("GET /users sem token retorna 401", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe(ERROR_KEYS.AUTH_INVALID_TOKEN);
    });

    it("GET /users com token inválido retorna 401", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", "Bearer token-invalido");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /users e GET /users/:id", () => {
    let adminToken;

    beforeAll(async () => {
      adminToken = await loginAsAdmin();
    });

    it("GET /users retorna lista de usuários", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const first = res.body.data[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("email");
      expect(first).toHaveProperty("type");
      expect(first).not.toHaveProperty("password");
      expect(first).not.toHaveProperty("passwordHash");
    });

    it("GET /users/:id retorna usuário existente", async () => {
      const listRes = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);
      const id = listRes.body.data[0].id;
      const res = await request(app)
        .get(`/users/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
    });

    it("GET /users/:id com id inexistente retorna 404", async () => {
      const res = await request(app)
        .get("/users/id-inexistente-123")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_NOT_FOUND);
    });
  });

  describe("POST /users", () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
      adminToken = await loginAsAdmin();
      const created = await createUserAndGetToken(adminToken);
      userToken = created.token;
    });

    it("admin cria usuário com body válido retorna 201", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Novo User",
          email: `novo-${Date.now()}@test.com`,
          type: "user",
          password: validPassword,
        });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Novo User");
      expect(res.body.data.type).toBe("user");
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    it("admin pode criar usuário tipo admin", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Outro Admin",
          email: `admin2-${Date.now()}@test.com`,
          type: "admin",
          password: validPassword,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe("admin");
    });

    it("user não pode criar usuário tipo admin retorna 403", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Fake Admin",
          email: `fake-${Date.now()}@test.com`,
          type: "admin",
          password: validPassword,
        });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
    });

    it("email já cadastrado retorna 409", async () => {
      const email = `duplicado-${Date.now()}@test.com`;
      await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Primeiro",
          email,
          type: "user",
          password: validPassword,
        });
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Segundo",
          email,
          type: "user",
          password: validPassword,
        });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe(ERROR_KEYS.AUTH_EMAIL_TAKEN);
    });

    it("body inválido (senha fraca) retorna 400", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          email: `weak-${Date.now()}@test.com`,
          type: "user",
          password: "fraca",
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(ERROR_KEYS.VALIDATION_INVALID_BODY);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("PUT /users/:id", () => {
    let adminToken;
    let userToken;
    let userId;
    let adminId;

    beforeAll(async () => {
      adminToken = await loginAsAdmin();
      const listRes = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);
      adminId = listRes.body.data.find((u) => u.email === "admin@spsgroup.com.br").id;
      const created = await createUserAndGetToken(adminToken);
      userToken = created.token;
      userId = created.user.id;
    });

    it("user pode atualizar a si mesmo (ex: nome)", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Nome Atualizado" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Nome Atualizado");
      expect(res.body.data.id).toBe(userId);
    });

    it("user não pode mudar próprio cargo para admin retorna 403", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ type: "admin" });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_ONLY_ADMIN_CAN_CREATE_ADMIN);
    });

    it("user não pode atualizar outro usuário retorna 403", async () => {
      const res = await request(app)
        .put(`/users/${adminId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Qualquer" });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_ONLY_ADMIN_CAN_MODIFY_OTHERS);
    });

    it("admin pode atualizar outro usuário", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Editado por Admin" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Editado por Admin");
    });

    it("admin padrão não pode ser atualizado retorna 403", async () => {
      const res = await request(app)
        .put(`/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Tentativa" });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_DEFAULT_USER_CANNOT_BE_MODIFIED);
    });

    it("PUT /users/:id inexistente retorna 404", async () => {
      const res = await request(app)
        .put("/users/id-inexistente-123")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "X" });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_NOT_FOUND);
    });
  });

  describe("DELETE /users/:id", () => {
    let adminToken;
    let userToken;
    let userId;
    let adminId;

    beforeAll(async () => {
      adminToken = await loginAsAdmin();
      const listRes = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);
      adminId = listRes.body.data.find((u) => u.email === "admin@spsgroup.com.br").id;
      const created = await createUserAndGetToken(adminToken);
      userToken = created.token;
      userId = created.user.id;
    });

    it("user não pode se auto deletar retorna 403", async () => {
      const res = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_CANNOT_DELETE_SELF);
    });

    it("admin não pode deletar admin padrão retorna 403", async () => {
      const createRes = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Outro Admin",
          email: `outro-admin-${Date.now()}@test.com`,
          type: "admin",
          password: validPassword,
        });
      expect(createRes.status).toBe(201);
      const loginRes = await request(app).post("/login").send({
        email: createRes.body.data.email,
        password: validPassword,
      });
      const tokenOutroAdmin = loginRes.body.data.token;
      const res = await request(app)
        .delete(`/users/${adminId}`)
        .set("Authorization", `Bearer ${tokenOutroAdmin}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_DEFAULT_USER_CANNOT_BE_DELETED);
    });

    it("admin pode deletar outro usuário retorna 200", async () => {
      const { user } = await createUserAndGetToken(adminToken);
      const res = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(ERROR_KEYS.USERS_DELETED);
      const getRes = await request(app)
        .get(`/users/${user.id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });

    it("DELETE /users/:id inexistente retorna 404", async () => {
      const res = await request(app)
        .delete("/users/id-inexistente-123")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe(ERROR_KEYS.USERS_NOT_FOUND);
    });
  });
});
