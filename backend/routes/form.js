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
    pass: "wiuu evao snpc stlu"  // Put your Gmail App Password here
  }
});

// MAIN POST ROUTE
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

    // 3. Send Notification Email to Admin (SHORT MESSAGE ONLY)
    // 3. Send simple notification email to Admin
    await transporter.sendMail({
      from: "vaibhav.j@aeronica.in",
      to: "vaibhav.j@aeronica.in",
      subject: "New Form Received - Aeronica",
      text: "A new form has been received. Visit the admin panel to view full details."
    });


    // 4. Auto reply to User
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

module.exports = router;
