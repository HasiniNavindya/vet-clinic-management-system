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


// GET /api/user/dashboard - Get user dashboard data
app.get("/api/user/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const userResult = await pool.query(
      "SELECT id, email, full_name, mobile_number, address, role, created_at FROM auth_users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's pets
    const petsResult = await pool.query(
      "SELECT * FROM pets_owned WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    // Get user preferences
    const preferencesResult = await pool.query(
      "SELECT * FROM user_preferences WHERE user_id = $1",
      [userId]
    );

    // Get appointments count
    const appointmentsCountResult = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE user_id = $1",
      [userId]
    );

    // Get upcoming appointments
    const upcomingAppointments = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.image_url as doctor_image,
              p.pet_name, a.doctor_notes
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN pets_owned p ON a.pet_id = p.id
       WHERE a.user_id = $1 AND a.appointment_date >= CURRENT_DATE
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [userId]
    );

    // Calculate user stats
    const stats = {
      visits: parseInt(appointmentsCountResult.rows[0].count) || 0,
      yearsOfService: 0,
      favouriteDoctors: 0,
      vetcoins: parseInt(appointmentsCountResult.rows[0].count) * 10 || 0
    };

    // Calculate years of service
    if (user.created_at) {
      const accountAge = new Date() - new Date(user.created_at);
      stats.yearsOfService = Math.floor(accountAge / (1000 * 60 * 60 * 24 * 365));
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        role: user.role,
        createdAt: user.created_at
      },
      pets: petsResult.rows,
      preferences: preferencesResult.rows[0] || null,
      stats,
      upcomingAppointments: upcomingAppointments.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/doctors - Get all doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM doctors ORDER BY name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/appointments - Get user's appointments
app.get("/api/appointments", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.image_url as doctor_image, 
              p.pet_name, a.doctor_notes
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN pets_owned p ON a.pet_id = p.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments - Book new appointment
app.post("/api/appointments", authenticateToken, async (req, res) => {
  const { doctor_id, pet_id, appointment_date, appointment_time, notes } = req.body;
  const userId = req.user.id;

  try {
    // Validate required fields
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Doctor, date, and time are required' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (user_id, doctor_id, pet_id, appointment_date, appointment_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, doctor_id, pet_id || null, appointment_date, appointment_time, notes || null]
    );

    // Get the full appointment details with doctor info
    const appointment = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.image_url as doctor_image,
              p.pet_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN pets_owned p ON a.pet_id = p.id
       WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(appointment.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// GET /api/pets - Get user's pets
app.get("/api/pets", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM pets_owned WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// POST /api/pets - Add new pet for user
app.post("/api/pets", authenticateToken, async (req, res) => {
  const { pet_name, species, breed, age_or_dob, gender, vaccination_status } = req.body;
  const userId = req.user.id;

  try {
    if (!pet_name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }

    const result = await pool.query(
      `INSERT INTO pets_owned (user_id, pet_name, species, breed, age_or_dob, gender, vaccination_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, pet_name, species || null, breed || null, age_or_dob || null, gender || null, vaccination_status || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Failed to add pet' });
  }
});

// DELETE /api/appointments/:id - Cancel appointment
app.delete("/api/appointments/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// PUT /api/appointments/:id/status - Update appointment status (for doctor actions)
app.put("/api/appointments/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!['confirmed', 'rejected', 'rescheduled', 'scheduled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      "UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
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