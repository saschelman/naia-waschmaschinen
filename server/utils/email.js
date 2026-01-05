const nodemailer = require("nodemailer");

// Email-Konfiguration (mit Gmail oder eigenem SMTP Server)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true", // false für TLS, true für SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test: Verbindung überprüfen
transporter.verify((error, success) => {
  if (error) {
    console.log("⚠️ Email-Service nicht verfügbar:", error.message);
  } else {
    console.log("✅ Email-Service bereit");
  }
});

// Email zum Bestätigen der Registrierung verschicken
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "NAIA - Bestätigung deiner Email-Adresse",
    html: `
      <h2>Willkommen bei NAIA! 🎉</h2>
      <p>Hallo ${firstName},</p>
      <p>vielen Dank für deine Registrierung! Um dein Konto zu aktivieren, bestätige bitte deine Email-Adresse:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Email bestätigen
        </a>
      </p>
      <p>Oder kopiere diesen Link in deinen Browser:</p>
      <p>${verificationUrl}</p>
      <p>Dieser Link ist 24 Stunden lang gültig.</p>
      <hr>
      <p>Wenn du dich nicht registriert hast, ignoriere diese Email.</p>
      <p>Mit freundlichen Grüßen,<br>Das NAIA Team</p>
    `,
    text: `
      Willkommen bei NAIA!
      
      Hallo ${firstName},
      
      Um dein Konto zu aktivieren, öffne bitte diesen Link:
      ${verificationUrl}
      
      Dieser Link ist 24 Stunden lang gültig.
      
      Wenn du dich nicht registriert hast, ignoriere diese Email.
      
      Das NAIA Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Verifikations-Email versendet an:", email);
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Versenden der Email:", error.message);
    return false;
  }
};

// Email für Passwort-Reset
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `http://localhost:5000/reset-password.html?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "NAIA - Passwort zurücksetzen",
    html: `
      <h2>Passwort zurücksetzen</h2>
      <p>Hallo ${firstName},</p>
      <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
      <p>
        <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Passwort zurücksetzen
        </a>
      </p>
      <p>Dieser Link ist 1 Stunde lang gültig.</p>
      <hr>
      <p>Wenn du diese Anfrage nicht gestellt hast, ignoriere diese Email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Passwort-Reset-Email versendet an:", email);
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Versenden der Email:", error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
