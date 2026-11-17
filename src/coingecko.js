const BASE_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc";

// Fetch coins from CoinGecko and map them to our own format
async function fetchCoins(query) {
  const res = await fetch(`${BASE_URL}&${query}`);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json();
  return data.map((c) => ({
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    price: c.current_price,
    change: c.price_change_percentage_24h,
  }));
}

const getTopCoins = () => fetchCoins("per_page=10&page=1");

// Returns null when the symbol is unknown
async function getCoinBySymbol(symbol) {
  const coins = await fetchCoins(`symbols=${encodeURIComponent(symbol.toLowerCase())}`);
  return coins[0] || null;
}

module.exports = { getTopCoins, getCoinBySymbol };