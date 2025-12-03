const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const writeToExcel = require("../excel");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vaibhav.j@aeronica.in",
    pass: "wiuu evao snpc stlu"  // Gmail App Password
  }
});

// =========================
// 1. POST /submit — Save form + email admin + reply user
// =========================
router.post("/submit", async (req, res) => {
  const data = req.body;

  try {
    // 1. Save to PostgreSQL
    await pool.query(
      `INSERT INTO aeronica_forms
      (name, company, contact, email, state, city, district, drones, services)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        data.name,
        data.company,
        data.contact,
        data.email,
        data.state,
        data.city,
        data.district,
        data.drones,
        data.services
      ]
    );

    // 2. Update Excel File
    writeToExcel({
      name: data.name,
      company: data.company,
      contact: data.contact,
      email: data.email,
      state: data.state,
      city: data.city,
      district: data.district,
      drones: data.drones,
      services: data.services
    });

    // 3. Send simple admin notification email
    await transporter.sendMail({
      from: "vaibhav.j@aeronica.in",
      to: "vaibhav.j@aeronica.in",
      subject: "New Form Received - Aeronica",
      text: "A new form has been received. Visit the admin panel to view full details."
    });

    // 4. Auto reply to user
    await transporter.sendMail({
      from: "vaibhav.j@aeronica.in",
      to: data.email,
      subject: "Thank you for contacting Aeronica",
      html: `
        <p>Hello ${data.name},</p>
        <p>Your submission has been received. Our team will contact you shortly.</p>
        <p>Regards,<br>Aeronica Advance Technologies</p>
      `
    });

    res.json({ status: "success" });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ status: "error" });
  }
});


// =========================
// 2. ADMIN DASHBOARD HANDLER (used by /form/admin in server.js)
// =========================
async function handleAdmin(req, res) {
  try {
    const result = await pool.query("SELECT * FROM aeronica_forms ORDER BY id DESC");

    let rowsHTML = "";
    result.rows.forEach((r) => {
      rowsHTML += `
        <tr>
          <td>${r.name}</td>
          <td>${r.company}</td>
          <td>${r.contact}</td>
          <td>${r.email}</td>
          <td>${r.state}</td>
          <td>${r.city}</td>
          <td>${r.district}</td>
          <td>${r.drones}</td>
          <td>${r.services}</td>
          <td>${r.timestamp ? new Date(r.timestamp).toLocaleString() : ""}</td>
        </tr>
      `;
    });

    res.send(`
      <html>
      <head>
        <title>Aeronica Admin Dashboard</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h2 { color: #004aad; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #004aad;
            color: white;
          }
          tr:nth-child(even) { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>📄 Aeronica – All Form Submissions</h2>

        <table>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Contact</th>
            <th>Email</th>
            <th>State</th>
            <th>City</th>
            <th>District</th>
            <th>Drones</th>
            <th>Services</th>
            <th>Timestamp</th>
          </tr>
          ${rowsHTML}
        </table>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch admin data");
  }
}


// Export main router + admin handler
router.handleAdmin = handleAdmin;
module.exports = router;
