const request = require("supertest");

// Never start a real Jest run from inside a test
jest.mock("../src/testrunner");
const testRunner = require("../src/testrunner");
const app = require("../src/app");

describe("POST /tests/run", () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  it("returns the test summary", async () => {
    testRunner.runTests.mockResolvedValue({ passed: 2, failed: 0, total: 2, tests: [] });
    const res = await request(app).post("/tests/run");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it("returns 500 when the test run crashes", async () => {
    testRunner.runTests.mockRejectedValue(new Error("boom"));
    const res = await request(app).post("/tests/run");
    expect(res.status).toBe(500);
  });

  it("returns 403 in production", async () => {
    process.env.NODE_ENV = "production";
    const res = await request(app).post("/tests/run");
    expect(res.status).toBe(403);
    expect(testRunner.runTests).not.toHaveBeenCalled();
  });
});
