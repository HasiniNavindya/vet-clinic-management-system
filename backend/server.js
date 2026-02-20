const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();

// JWT Secret Key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// CORS middleware - only once!
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /auth/register - Register new user
app.post("/auth/register", async (req, res) => {
  const {
    email,
    password,
    fullName,
    mobileNumber,
    address,
    emergencyContact,
    petName,
    species,
    breed,
    ageOrDob,
    gender,
    vaccinationStatus,
    vaccinationReminders,
    appointmentUpdates
  } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM auth_users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const userResult = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, mobile_number, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, mobile_number, address, role, created_at`,
      [email, passwordHash, fullName, mobileNumber || null, address || null]
    );

    const user = userResult.rows[0];

    // Insert pet information if provided
    if (petName) {
      await pool.query(
        `INSERT INTO pets_owned (user_id, pet_name, species, breed, age_or_dob, gender, vaccination_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, petName, species, breed, ageOrDob, gender, vaccinationStatus]
      );
    }

    // Insert user preferences
    await pool.query(
      `INSERT INTO user_preferences (user_id, vaccination_reminders, appointment_updates)
       VALUES ($1, $2, $3)`,
      [user.id, vaccinationReminders !== false, appointmentUpdates !== false]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /auth/login - Login user
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await pool.query(
      "SELECT id, email, password_hash, full_name, mobile_number, address, role FROM auth_users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /auth/me - Get current user profile (protected route)
app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, email, full_name, mobile_number, address, role, created_at FROM auth_users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
      address: user.address,
      role: user.role,
      createdAt: user.created_at
    });

  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// ============================================
// EXISTING ENDPOINTS
// ============================================

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

// PUT - update product
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category } = req.body;

  try {
    const result = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, image = $4, category = $5 WHERE id = $6 RETURNING *",
      [name, description, price, image, category, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT - update pet
app.put("/pets/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, price, description, image, location, seller, contactNumber } = req.body;

  try {
    const result = await pool.query(
      "UPDATE pets SET name = $1, age = $2, price = $3, description = $4, image = $5, location = $6, seller = $7, contact_number = $8 WHERE id = $9 RETURNING *",
      [name, age, price, description, image, location, seller, contactNumber, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE pet
app.delete("/pets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM pets WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.json({ message: "Pet deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - add new pet (updated to include contactNumber)
app.post("/pets", async (req, res) => {
  const { name, age, price, description, image, location, seller, contactNumber } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO pets (name, age, price, description, image, location, seller, contact_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [name, age, price, description, image, location, seller, contactNumber]
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
      "SELECT id, name, age, price, description, image, location, seller, contact_number AS \"contactNumber\", created_at AS \"createdAt\" FROM pets ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});