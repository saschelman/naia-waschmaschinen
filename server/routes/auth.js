const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getQuery, runQuery } = require("../database");
const config = require("../config");

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

    // User in DB speichern
    await runQuery(
      "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ message: "Registrierung erfolgreich" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Registrierung fehlgeschlagen" });
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
