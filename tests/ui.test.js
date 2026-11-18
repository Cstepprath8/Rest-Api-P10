const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
  it("serves the HTML test page", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
    expect(res.text).toContain("Crypto Price API");
  });
});