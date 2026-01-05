const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getQuery, runQuery } = require("../database");
const config = require("../config");
const { sendVerificationEmail } = require("../utils/email");

const router = express.Router();

// Middleware zur Token-Überprüfung
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token fehlt" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Ungültiger Token" });
  }
};

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validierung
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Passwort muss mindestens 8 Zeichen lang sein" });
    }

    // Email bereits vorhanden?
    const existingUser = await getQuery(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Diese Email-Adresse ist bereits registriert" });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verifikations-Token generieren
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // User in DB speichern
    await runQuery(
      "INSERT INTO users (firstName, lastName, email, password, verificationToken) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, verificationToken]
    );

    // Verifikations-Email versenden
    const emailSent = await sendVerificationEmail(
      email,
      firstName,
      verificationToken
    );

    if (emailSent) {
      res.status(201).json({
        message:
          "Registrierung erfolgreich! Bitte überprüfe dein Email-Postfach zur Bestätigung.",
      });
    } else {
      res.status(201).json({
        message:
          "Registrierung erfolgreich, aber Email konnte nicht versendet werden. Versuche später erneut.",
        warningEmailFailed: true,
      });
    }
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Registrierung fehlgeschlagen" });
  }
});

// EMAIL VERIFIZIEREN
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // User mit diesem Token suchen
    const user = await getQuery(
      "SELECT * FROM users WHERE verificationToken = ?",
      [token]
    );

    if (!user) {
      return res
        .status(400)
        .json({ message: "Ungültiger oder abgelaufener Token" });
    }

    // User als verified markieren
    await runQuery(
      "UPDATE users SET isVerified = 1, verificationToken = NULL WHERE id = ?",
      [user.id]
    );

    // HTML-Response mit Auto-Redirect
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email bestätigt - NAIA</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f0f0f0;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
          }
          h1 {
            color: #4CAF50;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin: 15px 0;
          }
          .countdown {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Email bestätigt!</h1>
          <p>Dein Account wurde erfolgreich aktiviert.</p>
          <p>Du wirst in <span class="countdown" id="countdown">5</span> Sekunden zum Login weitergeleitet...</p>
        </div>
        <script>
          let count = 5;
          const countdownEl = document.getElementById('countdown');
          
          const interval = setInterval(() => {
            count--;
            countdownEl.textContent = count;
            
            if (count === 0) {
              clearInterval(interval);
              window.location.href = '/login.html';
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: "Fehler beim Bestätigen der Email" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validierung
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email und Passwort erforderlich" });
    }

    // User in DB suchen
    const user = await getQuery("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({ message: "Email oder Passwort ungültig" });
    }

    // Email verifiziert?
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Bitte bestätige deine Email-Adresse, bevor du dich anmeldest.",
      });
    }

    // Passwort überprüfen
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email oder Passwort ungültig" });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    // User-Daten (ohne Password) zurückgeben
    const userWithoutPassword = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login erfolgreich",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login fehlgeschlagen" });
  }
});

// GET PROFILE (mit Token-Verifizierung)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await getQuery(
      "SELECT id, firstName, lastName, email, createdAt FROM users WHERE id = ?",
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User nicht gefunden" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Fehler beim Abrufen des Profils" });
  }
});

module.exports = router;
