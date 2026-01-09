const config = require("../config");

// Waitlist Bestätigungs-Email mit Brevo REST API
const sendWaitlistConfirmationEmail = async (email) => {
  const brevoApiKey = config.email.brevoApiKey;
  const noreplyEmail = config.email.noreplyEmail;

  const mailContent = {
    sender: {
      name: "NAIA Waschmaschinen",
      email: noreplyEmail,
    },
    to: [
      {
        email: email,
      },
    ],
    subject: "NAIA Waschmaschinen - Danke für dein Interesse!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffffff; padding: 40px 40px 30px 40px; border-radius: 8px 8px 0 0; color: #0f2440; text-align: center; border-bottom: 4px solid #1e3c72; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);">
          <img src="https://naia-waschmaschinen.de/images/LOGO_SCHRIFTZUG.png" alt="NAIA Logo" style="max-width: 170px; margin-bottom: 18px; filter: drop-shadow(0 3px 6px rgba(30, 60, 114, 0.25));" />
          <h1 style="margin: 0; font-size: 28px; display: inline-block; padding: 6px 12px; color: #1e3c72; background: linear-gradient(90deg, rgba(30, 60, 114, 0.08), rgba(42, 82, 152, 0.12)); border-radius: 10px;">Danke für dein Interesse! 🎉</h1>
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
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailContent),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Waitlist Bestätigungs-Email versendet an:", email);
      return true;
    } else {
      console.error("❌ Brevo API Error:", data);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Fehler beim Versenden der Waitlist-Email:",
      error.message
    );
    return false;
  }
};

module.exports = {
  sendWaitlistConfirmationEmail,
};
