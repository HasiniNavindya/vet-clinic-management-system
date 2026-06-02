require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const fs = require('fs');
const path = require('path');
const {
  normalizeRole,
  getRoleConfig,
  getPublicRoles,
  getDashboardPath,
  canSelfRegister,
  requiresDoctorApplication,
  requiresReceptionistApplication,
} = require("./config/roles");
const { canLogin, loginBlockMessage } = require("./config/accountStatus");
const { getDoctorProfileByUserId } = require("./services/doctorApplicationService");
const { getVetCoinBalance } = require("./services/vetcoinsService");
const doctorApplicationsRouter = require("./routes/doctorApplications");
const { router: receptionistApplicationsRouter, handleReceptionistRegister } = require("./routes/receptionistApplications");
const receptionistRouter = require("./routes/receptionist");
const adminUsersRouter = require("./routes/adminUsers");
const adminInsightsRouter = require("./routes/adminInsights");
const adminClinicDoctorsRouter = require("./routes/adminClinicDoctors");
const adminShopRouter = require("./routes/adminShop");
const adminMarketplaceRouter = require("./routes/adminMarketplace");
const adminPaymentsRouter = require("./routes/adminPayments");
const adminNotificationsRouter = require("./routes/adminNotifications");
const adminReportsRouter = require("./routes/adminReports");
const marketplacePetListingsRouter = require("./routes/marketplacePetListings");
const publicStatsRouter = require("./routes/publicStats");
const publicBlogRouter = require("./routes/publicBlog");
const feedbackRouter = require("./routes/feedback");
const { normalizeProductCategory, LISTING_STATUS } = require("./config/shop");
const { JWT_SECRET, authenticateToken, requireRole } = require("./middleware/auth");
const appointmentsRouter = require("./routes/appointments");
const medicalRecordsRouter = require("./routes/medicalRecords");
const vaccinationsRouter = require("./routes/vaccinations");
const prescriptionsRouter = require("./routes/prescriptions");
const paymentsRouter = require("./routes/payments");
const notificationsRouter = require("./routes/notifications");
const { getAvailableSlots, getDoctorMonthAvailability } = require("./services/appointmentService");
const { handleStripeCheckoutCompleted } = require("./services/paymentService");
const { constructWebhookEvent } = require("./services/stripeService");

const app = express();

// CORS middleware - only once!
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe webhook must receive raw body (register before express.json)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const parsed = constructWebhookEvent(req.body, signature);
    if (!parsed.ok) {
      return res.status(400).send(parsed.error);
    }
    try {
      if (parsed.event.type === 'checkout.session.completed') {
        await handleStripeCheckoutCompleted(parsed.event.data.object);
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

// Increase JSON body limit to allow image uploads as base64
app.use(express.json({ limit: '10mb' }));

// Ensure uploads folder exists and serve it statically
const uploadsDir = path.join(__dirname, 'uploads');
const petsUploadsDir = path.join(uploadsDir, 'pets');
const doctorLicensesDir = path.join(uploadsDir, 'doctor-licenses');
const doctorProfilesDir = path.join(uploadsDir, 'doctor-profiles');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(petsUploadsDir)) fs.mkdirSync(petsUploadsDir, { recursive: true });
if (!fs.existsSync(doctorLicensesDir)) fs.mkdirSync(doctorLicensesDir, { recursive: true });
if (!fs.existsSync(doctorProfilesDir)) fs.mkdirSync(doctorProfilesDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("API running...");
});


// GET /auth/roles - Public role definitions for login/register UI
app.get("/auth/roles", (req, res) => {
  res.json({ roles: getPublicRoles() });
});

app.use("/api/public", publicStatsRouter);
app.use("/api/public", publicBlogRouter);

// Public veterinarian application (same handlers as /api/doctor-applications — avoids 404 if router order/version differs)
app.get("/auth/doctor-application-meta", (req, res) => {
  res.json(doctorApplicationsRouter.getDoctorApplicationMetaData());
});
app.post("/auth/register-doctor", doctorApplicationsRouter.handleDoctorRegister);
app.post("/auth/register-receptionist", handleReceptionistRegister);

app.use("/api/doctor-applications", doctorApplicationsRouter);
app.use("/api/receptionist-applications", receptionistApplicationsRouter);
app.use("/api/receptionist", receptionistRouter);
app.use("/api/admin", adminUsersRouter);
app.use("/api/admin", adminInsightsRouter);
app.use("/api/admin", adminClinicDoctorsRouter);
app.use("/api/admin", adminShopRouter);
app.use("/api/admin", adminMarketplaceRouter);
app.use("/api/admin", adminPaymentsRouter);
app.use("/api/admin", adminNotificationsRouter);
app.use("/api/admin", adminReportsRouter);
app.use("/api/marketplace", marketplacePetListingsRouter);

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
  , role
  } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const requestedRole = normalizeRole(role) || 'user';
    let finalRole = requestedRole;

    const adminCount = await pool.query(
      "SELECT COUNT(*)::int AS count FROM auth_users WHERE LOWER(role) = 'admin'"
    );
    const hasAdmin = (adminCount.rows[0]?.count || 0) > 0;
    const isBootstrapAdmin = requestedRole === 'admin' && !hasAdmin;

    if (!canSelfRegister(requestedRole) && !isBootstrapAdmin) {
      try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
          return res.status(403).json({ error: 'Admin authorization required for this role' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminRole = normalizeRole(decoded.role);
        if (adminRole !== 'admin') {
          return res.status(403).json({ error: 'Only admins can create this account type' });
        }
        finalRole = requestedRole;
      } catch (err) {
        console.error('Role assignment verification error:', err.message || err);
        return res.status(403).json({ error: 'Invalid admin token' });
      }
    }

    const roleConfig = getRoleConfig(finalRole);
    if (!roleConfig) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (requiresDoctorApplication(finalRole)) {
      return res.status(400).json({
        error: 'Veterinarians must apply via the doctor registration form',
        applyUrl: '/register?role=doctor',
      });
    }

    if (requiresReceptionistApplication(finalRole)) {
      return res.status(400).json({
        error: 'Receptionists must apply via the receptionist registration form',
        applyUrl: '/register?role=receptionist',
      });
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

    // Insert user (include role)
    const userResult = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, mobile_number, address, emergency_contact, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, full_name, mobile_number, address, emergency_contact, role, created_at`,
      [email, passwordHash, fullName, mobileNumber || null, address || null, emergencyContact || null, finalRole]
    );

    const user = userResult.rows[0];

    // Insert pet information only for roles that require it
    if (petName && roleConfig.requiresPetInfo) {
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
      { id: user.id, email: user.email, role: finalRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const roleLabel = getRoleConfig(finalRole)?.label || finalRole;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        emergencyContact: user.emergency_contact,
        role: finalRole,
        roleLabel,
        dashboardPath: getDashboardPath(finalRole),
      }
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /auth/login - Login user
app.post("/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, mobile_number, address, emergency_contact, role, account_status
       FROM auth_users WHERE email = $1`,
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

    const dbRole = normalizeRole(user.role) || 'user';
    const selectedRole = role ? normalizeRole(role) : null;

    if (selectedRole && selectedRole !== dbRole) {
      const expectedLabel = getRoleConfig(dbRole)?.label || dbRole;
      return res.status(403).json({
        error: `This account is registered as ${expectedLabel}. Please log in with the correct role.`,
      });
    }

    const canonicalRole = dbRole;
    const accountStatus = user.account_status || 'active';

    if (!canLogin(accountStatus)) {
      let rejectionReason = null;
      if (canonicalRole === 'doctor') {
        const appRes = await pool.query(
          'SELECT rejection_reason FROM doctor_applications WHERE user_id = $1',
          [user.id]
        );
        rejectionReason = appRes.rows[0]?.rejection_reason;
      } else if (canonicalRole === 'receptionist') {
        const appRes = await pool.query(
          'SELECT rejection_reason FROM receptionist_applications WHERE user_id = $1',
          [user.id]
        );
        rejectionReason = appRes.rows[0]?.rejection_reason;
      }
      return res.status(403).json({
        error: loginBlockMessage(accountStatus, rejectionReason, canonicalRole),
        accountStatus,
        pendingApproval: accountStatus === 'pending',
      });
    }

    const roleLabel = getRoleConfig(canonicalRole)?.label || canonicalRole;
    let doctorProfileId = null;
    if (canonicalRole === 'doctor') {
      const profile = await getDoctorProfileByUserId(user.id);
      doctorProfileId = profile?.id || null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: canonicalRole },
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
        emergencyContact: user.emergency_contact,
        role: canonicalRole,
        roleLabel,
        dashboardPath: getDashboardPath(canonicalRole),
        accountStatus,
        doctorProfileId,
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
      `SELECT id, email, full_name, mobile_number, address, emergency_contact, role, account_status, created_at
       FROM auth_users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const canonicalRole = normalizeRole(user.role) || user.role;
    let doctorProfileId = null;
    if (canonicalRole === 'doctor') {
      const profile = await getDoctorProfileByUserId(user.id);
      doctorProfileId = profile?.id || null;
    }
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
      address: user.address,
      emergencyContact: user.emergency_contact,
      role: canonicalRole,
      roleLabel: getRoleConfig(canonicalRole)?.label || canonicalRole,
      dashboardPath: getDashboardPath(canonicalRole),
      accountStatus: user.account_status || 'active',
      doctorProfileId,
      createdAt: user.created_at
    });

  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /auth/me - Update profile (pet owner, doctor, staff, admin)
app.put("/auth/me", authenticateToken, requireRole('user', 'doctor', 'receptionist', 'admin'), async (req, res) => {
  const {
    fullName,
    mobileNumber,
    address,
    emergencyContact,
    currentPassword,
    newPassword,
    vaccinationReminders,
    appointmentUpdates,
  } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT id, password_hash, role FROM auth_users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const updates = [];
    const values = [];
    let parameterIndex = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${parameterIndex++}`);
      values.push(fullName);
    }

    if (mobileNumber !== undefined) {
      updates.push(`mobile_number = $${parameterIndex++}`);
      values.push(mobileNumber || null);
    }

    if (address !== undefined) {
      updates.push(`address = $${parameterIndex++}`);
      values.push(address || null);
    }

    if (emergencyContact !== undefined) {
      updates.push(`emergency_contact = $${parameterIndex++}`);
      values.push(emergencyContact || null);
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push(`password_hash = $${parameterIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0 && vaccinationReminders === undefined && appointmentUpdates === undefined) {
      return res.status(400).json({ error: 'No profile changes provided' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await pool.query(
      `UPDATE auth_users SET ${updates.join(', ')} WHERE id = $${parameterIndex}`,
      values
    );

    if (vaccinationReminders !== undefined || appointmentUpdates !== undefined) {
      await pool.query(
        `INSERT INTO user_preferences (user_id, vaccination_reminders, appointment_updates)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET
           vaccination_reminders = COALESCE(EXCLUDED.vaccination_reminders, user_preferences.vaccination_reminders),
           appointment_updates = COALESCE(EXCLUDED.appointment_updates, user_preferences.appointment_updates)`,
        [
          req.user.id,
          vaccinationReminders !== undefined ? vaccinationReminders : null,
          appointmentUpdates !== undefined ? appointmentUpdates : null,
        ]
      );
    }

    const updatedUser = await pool.query(
      "SELECT id, email, full_name, mobile_number, address, emergency_contact, role, created_at FROM auth_users WHERE id = $1",
      [req.user.id]
    );

    const updatedPreferences = await pool.query(
      "SELECT vaccination_reminders, appointment_updates FROM user_preferences WHERE user_id = $1",
      [req.user.id]
    );

    const user = updatedUser.rows[0];
    const canonicalRole = normalizeRole(user.role) || user.role;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        emergencyContact: user.emergency_contact,
        role: canonicalRole,
        roleLabel: getRoleConfig(canonicalRole)?.label || canonicalRole,
        dashboardPath: getDashboardPath(canonicalRole),
        createdAt: user.created_at,
      },
      preferences: updatedPreferences.rows[0] || null,
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
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
app.get("/api/user/dashboard", authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const userResult = await pool.query(
      "SELECT id, email, full_name, mobile_number, address, emergency_contact, role, created_at FROM auth_users WHERE id = $1",
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

    // Count clinic visits only after consultation is completed
    const completedVisitsResult = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );

    // Get upcoming appointments
    const upcomingAppointments = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, d.image_url as doctor_image,
              p.pet_name, a.doctor_notes
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN pets_owned p ON a.pet_id = p.id
       WHERE a.user_id = $1
         AND a.appointment_date >= CURRENT_DATE
         AND a.status IN ('approved', 'awaiting_payment')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [userId]
    );

    const vetcoins = await getVetCoinBalance(userId);

    // Calculate user stats
    const stats = {
      visits: parseInt(completedVisitsResult.rows[0].count) || 0,
      yearsOfService: 0,
      favouriteDoctors: 0,
      vetcoins,
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
        emergencyContact: user.emergency_contact,
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
      `SELECT d.* FROM doctors d
       LEFT JOIN auth_users u ON d.user_id = u.id
       WHERE d.user_id IS NULL OR u.account_status = 'active'
       ORDER BY d.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/:id - Single doctor profile
app.get("/api/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM doctors WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// GET /api/doctors/:id/availability-calendar?month=YYYY-MM
app.get("/api/doctors/:id/availability-calendar", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: 'Query parameter month is required (YYYY-MM)' });
    }
    const result = await getDoctorMonthAvailability(Number(id), month);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error('Availability calendar error:', error);
    res.status(500).json({ error: 'Failed to load availability calendar' });
  }
});

// GET /api/doctors/:id/availability?date=YYYY-MM-DD
app.get("/api/doctors/:id/availability", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Query parameter date is required (YYYY-MM-DD)' });
    }
    const { available, error } = await getAvailableSlots(Number(id), date);
    if (error) {
      return res.status(400).json({ error });
    }
    res.json({ date, doctorId: Number(id), slots: available });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Failed to load availability' });
  }
});

app.use("/api/appointments", appointmentsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/medical-records", medicalRecordsRouter);
app.use("/api/vaccinations", vaccinationsRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/notifications", notificationsRouter);

// GET /api/clinic/pets - Staff list all registered pets (for health record entry)
app.get("/api/clinic/pets", authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const { listPetsForUser } = require('./services/petAccess');
    const pets = await listPetsForUser(req.user.id, req.user.role);
    res.json(pets);
  } catch (error) {
    console.error('Clinic pets error:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// GET /api/pets - Get user's pets
app.get("/api/pets", authenticateToken, requireRole('user'), async (req, res) => {
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
app.get("/api/pets/:id", authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM pets_owned WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
});

// PUT /api/pets/:id - Update pet for current user
app.put("/api/pets/:id", authenticateToken, requireRole('user'), async (req, res) => {
  const { id } = req.params;
  const { pet_name, species, breed, age_or_dob, gender, vaccination_status, weight_kg } = req.body;

  try {
    if (!pet_name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }

    const result = await pool.query(
      `UPDATE pets_owned
       SET pet_name = $1, species = $2, breed = $3, age_or_dob = $4, gender = $5, vaccination_status = $6,
           weight_kg = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        pet_name,
        species || null,
        breed || null,
        age_or_dob || null,
        gender || null,
        vaccination_status || null,
        weight_kg != null && weight_kg !== '' ? Number(weight_kg) : null,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

// DELETE /api/pets/:id - Remove pet owned by current user
app.delete("/api/pets/:id", authenticateToken, requireRole('user'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM pets_owned WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

// POST /api/pets - Add new pet for user
app.post("/api/pets", authenticateToken, requireRole('user'), async (req, res) => {
  const { pet_name, species, breed, age_or_dob, gender, vaccination_status, weight_kg } = req.body;
  const userId = req.user.id;

  try {
    if (!pet_name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }

    const result = await pool.query(
      `INSERT INTO pets_owned (user_id, pet_name, species, breed, age_or_dob, gender, vaccination_status, weight_kg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        userId,
        pet_name,
        species || null,
        breed || null,
        age_or_dob || null,
        gender || null,
        vaccination_status || null,
        weight_kg != null && weight_kg !== '' ? Number(weight_kg) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Failed to add pet' });
  }
});

// POST /api/pets/:id/image - Upload pet image (expects base64 payload)
app.post('/api/pets/:id/image', authenticateToken, requireRole('user'), async (req, res) => {
  const { id } = req.params;
  const { imageBase64, filename } = req.body || {};

  if (!imageBase64 || !filename) {
    return res.status(400).json({ error: 'Missing imageBase64 or filename' });
  }

  try {
    const petResult = await pool.query(
      'SELECT id, user_id FROM pets_owned WHERE id = $1',
      [id]
    );

    if (petResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (petResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this pet' });
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const safeName = filename.replace(/[^a-z0-9.\-_]/gi, '_');
    const outName = `${Date.now()}-${safeName}`;
    const destPath = path.join(petsUploadsDir, outName);

    fs.writeFileSync(destPath, buffer);

    const publicUrl = `/uploads/pets/${outName}`;

    await pool.query(
      'UPDATE pets_owned SET image_url = $1 WHERE id = $2',
      [publicUrl, id]
    );

    res.json({ message: 'Image uploaded', imageUrl: publicUrl });
  } catch (error) {
    console.error('Pet image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// PUT - update product
app.put("/products/:id", authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, stockQuantity, isActive } = req.body;

  try {
    const cat =
      category !== undefined && category !== null
        ? normalizeProductCategory(category)
        : undefined;
    const updates = [];
    const vals = [];
    let p = 1;
    if (name !== undefined) {
      updates.push(`name = $${p++}`);
      vals.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${p++}`);
      vals.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${p++}`);
      vals.push(Number(price));
    }
    if (image !== undefined) {
      updates.push(`image = $${p++}`);
      vals.push(image);
    }
    if (cat !== undefined) {
      updates.push(`category = $${p++}`);
      vals.push(cat);
    }
    if (stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${p++}`);
      vals.push(Math.max(0, Math.floor(Number(stockQuantity))));
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${p++}`);
      vals.push(Boolean(isActive));
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    vals.push(id);
    const result = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${p} RETURNING *`,
      vals
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
app.delete("/products/:id", authenticateToken, requireRole('admin'), async (req, res) => {
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
app.put("/pets/:id", authenticateToken, requireRole('admin'), async (req, res) => {
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
app.delete("/pets/:id", authenticateToken, requireRole('admin'), async (req, res) => {
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
app.post("/pets", authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, age, price, description, image, location, seller, contactNumber } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO pets (
        name, age, price, description, image, location, seller, contact_number,
        owner_user_id, listing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9) RETURNING *`,
      [name, age, price, description, image, location, seller, contactNumber || null, LISTING_STATUS.APPROVED]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - add new product
app.post("/products", authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, description, price, image, category, stockQuantity, isActive } = req.body;

  try {
    const cat = normalizeProductCategory(category);
    const stock = Math.max(0, Math.floor(Number(stockQuantity ?? 0)));
    const active = isActive === false ? false : true;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image, category, stock_quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, image, cat, stock, active]
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
      `SELECT id, name, description, price, image, category,
              COALESCE(stock_quantity, 0)::int AS "stockQuantity",
              created_at AS "createdAt"
       FROM products
       WHERE COALESCE(is_active, true) = true
       ORDER BY id DESC`
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
      `SELECT id, name, age, price, description, image, location, seller,
              contact_number AS "contactNumber", created_at AS "createdAt"
       FROM pets
       WHERE listing_status IS NULL OR listing_status = $1
       ORDER BY created_at DESC NULLS LAST, id DESC`,
      [LISTING_STATUS.APPROVED]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pets/:id/image - upload pet image (base64)
app.post('/api/pets/:id/image', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { imageBase64, filename } = req.body;

    if (!imageBase64) return res.status(400).json({ error: 'No image data provided' });

    // determine extension
    const ext = filename && path.extname(filename) ? path.extname(filename) : '.jpg';
    const fileName = `pet_${id}_${Date.now()}${ext}`;
    const filePath = path.join(__dirname, 'uploads', 'pets', fileName);

    // save file
    const buffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/uploads/pets/${fileName}`;

    const result = await pool.query(
      'UPDATE pets_owned SET image_url = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [publicPath, id, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found or not owned by user' });

    res.json({ message: 'Image uploaded', pet: result.rows[0] });
  } catch (err) {
    console.error('Error uploading pet image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});