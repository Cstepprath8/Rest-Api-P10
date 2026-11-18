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

describe("CoinGecko errors", () => {
  it("returns 502 on GET /crypto when CoinGecko fails", async () => {
    coingecko.getTopCoins.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/crypto");
    expect(res.status).toBe(502);
  });

  it("returns 502 on GET /crypto/:symbol when CoinGecko fails", async () => {
    coingecko.getCoinBySymbol.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/crypto/btc");
    expect(res.status).toBe(502);
  });
});