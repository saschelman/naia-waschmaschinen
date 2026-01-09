const express = require("express");
const { getQuery, runQuery } = require("../database");
const config = require("../config");
const { sendWaitlistConfirmationEmail } = require("../utils/email");

const router = express.Router();

// Waitlist Signup - einfach nur Email
router.post("/signup", async (req, res) => {
  try {
    const { email } = req.body;

    // Validierung
    if (!email || !email.includes("@")) {
      return res
        .status(400)
        .json({ message: "Gültige Email ist erforderlich" });
    }

    // Email bereits vorhanden?
    const existingEntry = await getQuery(
      "SELECT email FROM waitlist WHERE email = ?",
      [email]
    );

    if (existingEntry) {
      return res.status(409).json({
        message: "Diese Email ist bereits auf der Waitlist",
      });
    }

    // In Datenbank speichern
    await runQuery("INSERT INTO waitlist (email) VALUES (?)", [email]);

    // Bestätigungs-Email versenden
    await sendWaitlistConfirmationEmail(email);

    res.status(200).json({
      message: "Danke! Bestätigungs-Email versendet",
    });
  } catch (error) {
    console.error("❌ Waitlist Signup Fehler:", error);
    res.status(500).json({ message: "Fehler beim Speichern der Email" });
  }
});

module.exports = router;
