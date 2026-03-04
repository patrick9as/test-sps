process.env.LOGIN_RATE_LIMIT_MAX = "5";
const request = require("supertest");
const app = require("../app");

describe("POST /login", () => {
  it("retorna token com credenciais válidas do admin", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "admin@spsgroup.com.br", password: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
  });

  it("retorna 401 com credenciais inválidas", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "admin@spsgroup.com.br", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("retorna 429 após várias tentativas erradas (rate limit)", async () => {
    const agent = request(app);
    for (let i = 0; i < 4; i++) {
      const res = await agent
        .post("/login")
        .send({ email: "admin@spsgroup.com.br", password: "wrong" });
      expect(res.status).toBe(401);
    }
    const res = await agent
      .post("/login")
      .send({ email: "admin@spsgroup.com.br", password: "wrong" });
    expect(res.status).toBe(429);
    expect(res.body.error).toBeDefined();
    expect(res.body.remaining).toBe(0);
  });
});
