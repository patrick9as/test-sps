const request = require("supertest");
const app = require("../app");

describe("Swagger /api-docs", () => {
  it("GET /api-docs responde com a página da documentação ou redirect", async () => {
    const res = await request(app).get("/api-docs");
    expect([200, 301, 302]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers["content-type"]).toMatch(/text\/html/);
    }
  });

  it("GET /api-docs/ responde com a página da documentação ou redirect", async () => {
    const res = await request(app).get("/api-docs/");
    expect([200, 301, 302]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers["content-type"]).toMatch(/text\/html/);
    }
  });

  it("GET /api-docs.json retorna a spec OpenAPI", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
    expect(res.body.paths["/health"]).toBeDefined();
    expect(res.body.paths["/login"]).toBeDefined();
    expect(res.body.paths["/users"]).toBeDefined();
  });
});
