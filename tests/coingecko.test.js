const { getTopCoins, getCoinBySymbol } = require("../src/coingecko");

// A coin as CoinGecko returns it (only the fields we use, plus noise)
const apiCoin = {
  id: "bitcoin", symbol: "btc", name: "Bitcoin",
  current_price: 27000, price_change_percentage_24h: 2.3, market_cap: 1,
};

beforeEach(() => {
  // Replace the real network call with a fake
  global.fetch = jest.fn();
});

describe("getTopCoins", () => {
  it("maps CoinGecko data to our own format", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [apiCoin] });
    expect(await getTopCoins()).toEqual([
      { symbol: "BTC", name: "Bitcoin", price: 27000, change: 2.3 },
    ]);
  });

  it("throws when CoinGecko returns an error", async () => {
    fetch.mockResolvedValue({ ok: false, status: 429 });
    await expect(getTopCoins()).rejects.toThrow("CoinGecko error: 429");
  });
});

describe("getCoinBySymbol", () => {
  it("asks CoinGecko for the lowercase symbol", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [apiCoin] });
    await getCoinBySymbol("BTC");
    expect(fetch.mock.calls[0][0]).toContain("symbols=btc");
  });

  it("returns null when CoinGecko finds nothing", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [] });
    expect(await getCoinBySymbol("nope")).toBeNull();
  });
});