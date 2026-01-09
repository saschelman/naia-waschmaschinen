const nodemailer = require("nodemailer");
const config = require("../config");

// Email-Konfiguration (mit Gmail oder eigenem SMTP Server)
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
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
  const verificationUrl = `${config.frontendUrl}/api/auth/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `NAIA Support <${config.email.noreplyEmail}>`,
    to: email,
    subject: "NAIA - Bestätigung deiner Email-Adresse",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2196f3 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
          <h1 style="margin: 0;">Willkommen bei NAIA! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p>Hallo <strong>${firstName}</strong>,</p>
          
          <p>vielen Dank für deine Registrierung! Um dein Konto zu aktivieren, bestätige bitte deine Email-Adresse:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 40px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
              Email jetzt bestätigen
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">Oder kopiere diesen Link in deinen Browser:</p>
          <p style="background: #fff; padding: 10px; border-left: 3px solid #2196f3; color: #333; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
          
          <p style="color: #999; font-size: 12px;">⏱️ Dieser Link ist 24 Stunden lang gültig.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">Wenn du dich nicht registriert hast, ignoriere diese Email.</p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Mit freundlichen Grüßen,<br><strong>Das NAIA Team</strong></p>
        </div>
      </div>
    `,
    text: `
Willkommen bei NAIA!

Hallo ${firstName},

vielen Dank für deine Registrierung! Um dein Konto zu aktivieren, öffne bitte diesen Link:
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
  const resetUrl = `${config.frontendUrl}/reset-password.html?token=${resetToken}`;

  const mailOptions = {
    from: `NAIA Support <${config.email.noreplyEmail}>`,
    to: email,
    subject: "NAIA - Passwort zurücksetzen",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2196f3 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
          <h1 style="margin: 0;">Passwort zurücksetzen</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <p>Hallo <strong>${firstName}</strong>,</p>
          
          <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 14px 40px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
              Passwort zurücksetzen
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">Oder kopiere diesen Link in deinen Browser:</p>
          <p style="background: #fff; padding: 10px; border-left: 3px solid #2196f3; color: #333; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          
          <p style="color: #999; font-size: 12px;">⏱️ Dieser Link ist 1 Stunde lang gültig.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">Wenn du diese Anfrage nicht gestellt hast, ignoriere diese Email.</p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Das NAIA Team</p>
        </div>
      </div>
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

// Waitlist Bestätigungs-Email
const sendWaitlistConfirmationEmail = async (email) => {
  const mailOptions = {
    from: `NAIA <${config.email.noreplyEmail}>`,
    to: email,
    subject: "NAIA Waschmaschinen - Danke für dein Interesse!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 40px 30px 40px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <img src="https://naia-waschmaschinen.de/images/LOGO_WEB.png" alt="NAIA Logo" style="max-width: 150px; margin-bottom: 20px;" />
          <h1 style="margin: 0; font-size: 28px;">Danke für dein Interesse! 🎉</h1>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9; border-radius: 0 0 8px 8px; border-bottom: 3px solid #ffc107;">
          <p style="font-size: 16px; color: #333;">Hallo,</p>
          
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            wir freuen uns, dass du dich für <strong>NAIA Waschmaschinen</strong> interessierst! 
            Deine Email-Adresse wurde erfolgreich auf unserer Warteliste registriert.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
            <h2 style="margin: 0 0 15px 0; color: #1e3c72; font-size: 18px;">🚀 Der Launch kommt am</h2>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffc107;">
              1. April 2026
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              Sei unter den Ersten, die von unseren exklusiven Launch-Vorteilen profitieren!
            </p>
          </div>
          
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Du erhältst von uns alle wichtigen Informationen und exklusive Vorteile. 
            Wir freuen uns, dich bald begrüßen zu dürfen!
          </p>
          
          <hr style="border: none; border-top: 2px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 13px; margin: 0;">
            Mit freundlichen Grüßen,<br>
            <strong>Das NAIA Team</strong><br>
            <em>Innovative Waschmaschinen für dein Zuhause</em>
          </p>
        </div>
      </div>
    `,
    text: `
Danke für dein Interesse!

Hallo,

wir freuen uns, dass du dich für NAIA Waschmaschinen interessierst!
Deine Email-Adresse wurde erfolgreich auf unserer Warteliste registriert.

🚀 Der Launch kommt am 1. April 2026

Sei unter den Ersten, die von unseren exklusiven Launch-Vorteilen profitieren!

Mit freundlichen Grüßen,
Das NAIA Team
Innovative Waschmaschinen für dein Zuhause
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Waitlist Bestätigungs-Email versendet an:", email);
    return true;
  } catch (error) {
    console.error(
      "❌ Fehler beim Versenden der Waitlist-Email:",
      error.message
    );
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWaitlistConfirmationEmail,
};
