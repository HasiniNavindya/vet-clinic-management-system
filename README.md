<html lang="en">
<body>
  <div class="container">
    <header>
      <h1>🐾 Veterinary Clinic Management System</h1>
    </header>

    <section>
      <p class="lead">
        A full-featured web application designed to digitalize and streamline veterinary clinic operations.
        This system provides appointment booking, pet health record management, doctor availability scheduling,
        online shop features, marketplace listings, and emergency clinic locating — all in one platform.
      </p>
    </section>

    <section>
      <h2>🚀 Project Overview</h2>
      <p>
        The <strong>Veterinary Clinic Management System</strong> is built to solve the challenges found in
        traditional veterinary clinics in Sri Lanka, including:
      </p>
      <ul>
        <li>Manual appointment handling</li>
        <li>Paper-based medical records</li>
        <li>Poor communication with pet owners</li>
        <li>No centralized platform for clinics</li>
        <li>No online shopping or marketplace</li>
        <li>Difficulty finding emergency veterinary care</li>
      </ul>
      <p class="small">This system brings modern web technology to veterinary services and improves the experience for pet owners, veterinarians, clinic admins, and staff.</p>
    </section>

    <section>
      <h2>✔️ Key Features</h2>

      <h3 class="feature-title">👩‍⚕️ Clinic Operations</h3>
      <ul>
        <li>Manage veterinary clinics</li>
        <li>Doctor profiles &amp; specializations</li>
        <li>Doctor availability scheduling</li>
        <li>Appointment approval system</li>
        <li>Digital prescriptions</li>
        <li>Medical record management</li>
        <li>Vaccination &amp; treatment tracking</li>
      </ul>

      <h3 class="feature-title">🐶 Pet Owner Features</h3>
      <ul>
        <li>Create / manage pet profiles</li>
        <li>Book appointments online</li>
        <li>View medical history</li>
        <li>Receive notifications &amp; reminders</li>
        <li>Buy pet supplies from the clinic shop</li>
        <li>Advertise pets for sale (Marketplace)</li>
        <li>Locate emergency clinics on maps</li>
      </ul>

      <h3 class="feature-title">🛒 E-Commerce Module</h3>
      <ul>
        <li>Online shop (food, toys, medicine)</li>
        <li>Add to cart &amp; place orders</li>
        <li>Online payment support (Stripe)</li>
        <li>Order tracking</li>
      </ul>

      <h3 class="feature-title">📊 Admin Panel</h3>
      <ul>
        <li>Manage clinic staff</li>
        <li>Manage inventory</li>
        <li>Generate monthly reports</li>
        <li>View analytics (appointments, sales, revenue)</li>
      </ul>

      <h3 class="feature-title">🔔 Notifications</h3>
      <ul>
        <li>Email reminders (SendGrid / Nodemailer)</li>
        <li>SMS alerts (Twilio)</li>
        <li>Appointment confirmation</li>
        <li>Vaccination due reminders</li>
      </ul>
    </section>

    <section>
      <h2>🧩 System Architecture</h2>
      <ul>
        <li><strong>Frontend:</strong> Next.js (React) + Tailwind CSS</li>
        <li><strong>Backend:</strong> Node.js + Express</li>
        <li><strong>Database:</strong> PostgreSQL (Prisma ORM)</li>
        <li><strong>Authentication:</strong> JWT / NextAuth</li>
        <li><strong>Storage:</strong> Local (dev) / AWS S3 (prod)</li>
        <li><strong>Notifications:</strong> SendGrid / Nodemailer</li>
        <li><strong>Payments:</strong> Stripe</li>
        <li><strong>Maps:</strong> Google Maps API</li>
        <li><strong>Deployment:</strong> Vercel (Frontend) + Render / AWS (Backend)</li>
      </ul>
    </section>

    <section>
      <h2>📦 Quick start (examples)</h2>
      <p class="small">Clone the repo, install dependencies, and run dev servers for each app.</p>
      <pre><code>git clone https://github.com/YOUR-USERNAME/vet-clinic-management-system.git
cd vet-clinic-management-system

# Backend (example)
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (example)
cd ../frontend
npm install
npm run dev
</code></pre>
      <p class="small">Adjust environment variables in <code>backend/.env</code> and <code>frontend/.env</code>.</p>
    </section>

    <section>
      <h2>🔮 Future Enhancements</h2>
      <ul>
        <li>Mobile app (React Native / Flutter)</li>
        <li>AI-based symptom checker</li>
        <li>Real-time chat between vet &amp; owner</li>
        <li>Loyalty &amp; membership features</li>
        <li>Multi-language support (Sinhala / Tamil / English)</li>
      </ul>
    </section>

    <footer style="text-align:center; margin-top:10px;">
      <p class="small">&copy; <strong>Hasini Navindya</strong> — Veterinary Clinic Management System. For academic use &amp; learning purposes.</p>
    </footer>
  </div>
</body>
</html>
