// In-memory watchlist (resets when the server restarts)
const items = new Map();

const list = () => [...items.values()];
const get = (symbol) => items.get(symbol) || null;

function add(symbol, note = "") {
  const item = { symbol, note };
  items.set(symbol, item);
  return item;
}

// Returns null when the symbol is not in the watchlist
function update(symbol, note) {
  const item = items.get(symbol);
  if (!item) return null;
  item.note = note;
  return item;
}

const remove = (symbol) => items.delete(symbol);
const clear = () => items.clear();

module.exports = { list, get, add, update, remove, clear };