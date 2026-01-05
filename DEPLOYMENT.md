# NAIA Backend Deployment auf Render.com

## Schritte:

1. **GitHub Repository erstellen** (nur für Backend)

   - Erstelle ein neues Repo z.B. `naia-backend`
   - Pushe den `server/` Ordner dorthin

2. **Auf Render.com registrieren**

   - https://render.com (kostenlos)
   - Mit GitHub verbinden

3. **New Web Service** erstellen:

   - Repository auswählen
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: Node

4. **Environment Variables** setzen:

   - `JWT_SECRET` = dein-secret-key
   - `EMAIL_USER` = deine@email.com
   - `EMAIL_PASSWORD` = dein-app-passwort
   - `NODE_ENV` = production

5. **Deploy** → Du bekommst eine URL wie:
   `https://naia-backend.onrender.com`

## Frontend anpassen:

In allen HTML-Dateien (login.html, signup.html, etc.) die API-URL ändern:

```javascript
// Statt:
fetch('/api/auth/login', ...)

// Jetzt:
fetch('https://naia-backend.onrender.com/api/auth/login', ...)
```

## Alternative: Vercel (Frontend + Backend)

Vercel kann beides hosten:

- https://vercel.com
- Einfaches Deployment
- Serverless Functions für Backend
