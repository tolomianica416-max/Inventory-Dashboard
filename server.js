const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database(path.join(__dirname, "inventory.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// READ all
app.get("/api/items", (req, res) => {
  res.json(db.prepare("SELECT * FROM items ORDER BY id DESC").all());
});

// CREATE
app.post("/api/items", (req, res) => {
  const { name, category, quantity, price } = req.body;
  if (!name || !category) return res.status(400).json({ error: "Name and category are required" });
  const info = db
    .prepare("INSERT INTO items (name, category, quantity, price) VALUES (?, ?, ?, ?)")
    .run(name, category, Number(quantity) || 0, Number(price) || 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

// UPDATE
app.put("/api/items/:id", (req, res) => {
  const { name, category, quantity, price } = req.body;
  const info = db
    .prepare("UPDATE items SET name = ?, category = ?, quantity = ?, price = ? WHERE id = ?")
    .run(name, category, Number(quantity) || 0, Number(price) || 0, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Item not found" });
  res.json({ success: true });
});

// DELETE
app.delete("/api/items/:id", (req, res) => {
  const info = db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Item not found" });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
