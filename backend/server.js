const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// CORS middleware - only once!
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

// GET users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - add new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
// POST - add new pet
app.post("/pets", async (req, res) => {
  const { name, age, price, description, image, location, seller } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO pets (name, age, price, description, image, location, seller) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, age, price, description, image, location, seller]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - add new product
app.post("/products", async (req, res) => {
  const { name, description, price, image, category } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO products (name, description, price, image, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, price, image, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET products
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, price, image, category, created_at AS \"createdAt\" FROM products ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET pets
app.get("/pets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, age, price, description, image, location, seller, created_at AS \"createdAt\" FROM pets ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});