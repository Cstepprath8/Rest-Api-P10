const request = require("supertest");

// Mock the CoinGecko client so tests never hit the real API
jest.mock("../src/coingecko");
const coingecko = require("../src/coingecko");
const app = require("../src/app");

describe("GET /crypto", () => {
  it("returns a list of coins", async () => {
    coingecko.getTopCoins.mockResolvedValue([
      { symbol: "BTC", name: "Bitcoin", price: 27000, change: 2.3 },
    ]);

    const res = await request(app).get("/crypto");

    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      symbol: "BTC", name: "Bitcoin", price: 27000, change: 2.3,
    });
  });
});

describe("GET /crypto/:symbol", () => {
  it("returns a single coin", async () => {
    coingecko.getCoinBySymbol.mockResolvedValue({
      symbol: "ETH", name: "Ethereum", price: 1800, change: -1.2,
    });

    const res = await request(app).get("/crypto/eth");

    expect(res.status).toBe(200);
    expect(res.body.symbol).toBe("ETH");
  });

  it("returns 404 for an unknown symbol", async () => {
    coingecko.getCoinBySymbol.mockResolvedValue(null);

    const res = await request(app).get("/crypto/doesnotexist");

    expect(res.status).toBe(404);
  });
});