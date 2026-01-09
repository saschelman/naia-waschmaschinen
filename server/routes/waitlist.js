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

    // Bestätigungs-Email versenden (asynchron - nicht abwarten!)
    sendWaitlistConfirmationEmail(email).catch((err) => {
      console.error("Email konnte nicht versendet werden:", err);
    });

    // Auch zu Google Forms senden (asynchron)
    const params = new URLSearchParams();
    params.append("entry.1642117603", email);
    fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSeuAuVOPdW-t8jhPe9au9V_yB58wwOU3oCgEyrzltLd4oU6aA/formResponse",
      {
        method: "POST",
        body: params,
      }
    ).catch((err) => {
      console.error("Google Forms Sync fehlgeschlagen:", err);
    });

    // Formspree Benachrichtigung senden (asynchron)
    fetch("https://formspree.io/f/mkogangl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        message: `Neue Waitlist-Anmeldung: ${email}`,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.error("Formspree Benachrichtigung fehlgeschlagen:", err);
    });

    // Sofort Erfolg zurücksenden (nicht auf Email warten)
    res.status(200).json({
      message: "Danke! Du wurdest zur Warteliste hinzugefügt",
    });
  } catch (error) {
    console.error("❌ Waitlist Signup Fehler:", error);
    res.status(500).json({ message: "Fehler beim Speichern der Email" });
  }
});

module.exports = router;
