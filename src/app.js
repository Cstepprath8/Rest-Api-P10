const express = require("express");
const coingecko = require("./coingecko");

const app = express();
app.use(express.json());

// List of popular coins
app.get("/crypto", async (req, res) => {
  try {
    res.json(await coingecko.getTopCoins());
  } catch (err) {
    res.status(502).json({ error: "Could not fetch data from CoinGecko" });
  }
});

// Single coin by symbol
app.get("/crypto/:symbol", async (req, res) => {
  try {
    const coin = await coingecko.getCoinBySymbol(req.params.symbol);
    if (!coin) return res.status(404).json({ error: "Coin not found" });
    res.json(coin);
  } catch (err) {
    res.status(502).json({ error: "Could not fetch data from CoinGecko" });
  }
});

module.exports = app;