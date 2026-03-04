const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("retorna status ok e modo de armazenamento", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.storage).toBeDefined();
    expect(["memory", "postgres"]).toContain(res.body.data.storage);
  });
});
