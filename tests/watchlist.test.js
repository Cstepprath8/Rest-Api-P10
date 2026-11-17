const request = require("supertest");

// Mock the CoinGecko client so tests never hit the real API
jest.mock("../src/coingecko");
const coingecko = require("../src/coingecko");
const watchlist = require("../src/watchlist");
const app = require("../src/app");

beforeEach(() => {
  // Start every test with an empty watchlist and a known coin
  watchlist.clear();
  coingecko.getCoinBySymbol.mockResolvedValue({
    symbol: "BTC", name: "Bitcoin", price: 27000, change: 2.3,
  });
});

describe("POST /crypto", () => {
  it("adds a coin to the watchlist", async () => {
    const res = await request(app).post("/crypto").send({ symbol: "btc", note: "hodl" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ symbol: "BTC", note: "hodl" });
  });

  it("returns 400 without a symbol", async () => {
    const res = await request(app).post("/crypto").send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown coin", async () => {
    coingecko.getCoinBySymbol.mockResolvedValue(null);
    const res = await request(app).post("/crypto").send({ symbol: "nope" });
    expect(res.status).toBe(404);
  });

  it("returns 409 when the coin is already in the watchlist", async () => {
    await request(app).post("/crypto").send({ symbol: "btc" });
    const res = await request(app).post("/crypto").send({ symbol: "btc" });
    expect(res.status).toBe(409);
  });
});

describe("GET /watchlist", () => {
  it("returns the watchlist", async () => {
    await request(app).post("/crypto").send({ symbol: "btc" });
    const res = await request(app).get("/watchlist");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("PUT /crypto/:symbol", () => {
  it("updates the note", async () => {
    await request(app).post("/crypto").send({ symbol: "btc", note: "old" });
    const res = await request(app).put("/crypto/btc").send({ note: "new" });
    expect(res.status).toBe(200);
    expect(res.body.note).toBe("new");
  });

  it("returns 400 without a note", async () => {
    await request(app).post("/crypto").send({ symbol: "btc" });
    const res = await request(app).put("/crypto/btc").send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 when the coin is not in the watchlist", async () => {
    const res = await request(app).put("/crypto/btc").send({ note: "x" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /crypto/:symbol", () => {
  it("removes a coin from the watchlist", async () => {
    await request(app).post("/crypto").send({ symbol: "btc" });
    const res = await request(app).delete("/crypto/btc");
    expect(res.status).toBe(204);
    const list = await request(app).get("/watchlist");
    expect(list.body).toEqual([]);
  });

  it("returns 404 when the coin is not in the watchlist", async () => {
    const res = await request(app).delete("/crypto/btc");
    expect(res.status).toBe(404);
  });
});