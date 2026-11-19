const path = require("path");
const express = require("express");
const coingecko = require("./coingecko");
const watchlist = require("./watchlist");
const testRunner = require("./testrunner");

const app = express();
app.use(express.json());

// Serve the HTML test page from the public folder
app.use(express.static(path.join(__dirname, "..", "public")));

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

// Show the watchlist
app.get("/watchlist", (req, res) => {
  res.json(watchlist.list());
});

// Add a coin to the watchlist
app.post("/crypto", async (req, res) => {
  const { symbol, note } = req.body || {};
  if (typeof symbol !== "string" || !symbol) {
    return res.status(400).json({ error: "symbol is required" });
  }
  const key = symbol.toUpperCase();
  if (watchlist.get(key)) {
    return res.status(409).json({ error: "Coin is already in the watchlist" });
  }
  try {
    const coin = await coingecko.getCoinBySymbol(symbol);
    if (!coin) return res.status(404).json({ error: "Coin not found" });
    res.status(201).json(watchlist.add(key, note));
  } catch (err) {
    res.status(502).json({ error: "Could not fetch data from CoinGecko" });
  }
});

// Update the note of a watchlist coin
app.put("/crypto/:symbol", (req, res) => {
  const { note } = req.body || {};
  if (typeof note !== "string") {
    return res.status(400).json({ error: "note must be a string" });
  }
  const item = watchlist.update(req.params.symbol.toUpperCase(), note);
  if (!item) return res.status(404).json({ error: "Coin is not in the watchlist" });
  res.json(item);
});

// Remove a coin from the watchlist
app.delete("/crypto/:symbol", (req, res) => {
  if (!watchlist.remove(req.params.symbol.toUpperCase())) {
    return res.status(404).json({ error: "Coin is not in the watchlist" });
  }
  res.status(204).end();
});

// Run the test suite (disabled in production)
app.post("/tests/run", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "The test runner is disabled in production" });
  }
  try {
    res.json(await testRunner.runTests());
  } catch (err) {
    res.status(500).json({ error: "Could not run the tests" });
  }
});

module.exports = app;
