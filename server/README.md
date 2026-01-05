# NAIA Waschmaschinen Login & Signup System

## Installation

### 1. Node.js und npm installieren

Falls noch nicht installiert: https://nodejs.org

### 2. Dependencies installieren

```bash
cd server
npm install
```

### 3. .env Datei erstellen

Erstelle eine `.env` Datei im `server` Verzeichnis:

```
PORT=5000
JWT_SECRET=dein-geheim-schluessel-hier-aendern
NODE_ENV=development
```

> **WICHTIG:** In Produktion einen starken, zufälligen JWT_SECRET verwenden!

### 4. Server starten

**Entwicklung (mit Auto-Reload):**

```bash
npm run dev
```

**Produktion:**

```bash
npm start
```

Der Server läuft dann unter `http://localhost:5000`

---

## Verwendung

### Frontend-URLs

- **Home:** http://localhost:5000/index.html
- **Signup:** http://localhost:5000/signup.html
- **Login:** http://localhost:5000/login.html
- **Dashboard:** http://localhost:5000/dashboard.html (nur für angemeldete Nutzer)

### API-Endpoints

#### 1. Registrierung (Signup)

```
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "password": "SecurePassword123!"
}

Response (201):
{
  "message": "Registrierung erfolgreich"
}
```

#### 2. Anmeldung (Login)

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "max@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "message": "Login erfolgreich",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max@example.com",
    "createdAt": "2024-01-05T10:30:00.000Z"
  }
}
```

#### 3. Profil abrufen (geschützt)

```
GET /api/auth/profile
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "createdAt": "2024-01-05T10:30:00.000Z"
}
```

---

## Dateien-Struktur

```
naia-waschmaschinen/
├── server/
│   ├── server.js              # Express Server
│   ├── config.js              # Konfiguration
│   ├── database.js            # SQLite Datenbank Setup
│   ├── routes/
│   │   └── auth.js            # Auth-Endpoints (Signup, Login, Profile)
│   ├── package.json           # Dependencies
│   ├── .env                   # Umgebungsvariablen (lokal)
│   └── database.db            # SQLite Datenbank (wird auto-erstellt)
├── login.html                 # Login-Seite
├── signup.html                # Signup-Seite
├── dashboard.html             # Benutzer-Dashboard
├── index.html                 # Homepage
└── ...
```

---

## Sicherheitsfeatures

✅ **Passwort-Hashing:** bcryptjs (10 Salt-Runden)  
✅ **JWT Tokens:** 7 Tage Gültigkeitsdauer  
✅ **Token-Verifizierung:** Bei geschützten Endpoints  
✅ **CORS:** Aktiviert für sichere Cross-Origin-Requests  
✅ **Input-Validierung:** Auf Server- und Client-Seite

---

## Weitere Features für Zukunft

- [ ] Email-Verifizierung
- [ ] Passwort-Reset-Funktion
- [ ] Refresh-Tokens
- [ ] Admin-Panel
- [ ] Waschmaschinen-Verwaltung
- [ ] Bestellungssystem
- [ ] Payment-Integration (Stripe, PayPal)

---

## Troubleshooting

### Port ist bereits belegt

```bash
# Windows: Port 5000 ändern in .env
# Linux/Mac: Prozess beenden
lsof -ti:5000 | xargs kill -9
```

### Datenbank-Fehler

Lösche `server/database.db` und starten den Server neu. Die Datenbank wird automatisch neu erstellt.

### CORS-Fehler

Stelle sicher, dass der Server läuft und die URL korrekt ist.

---

## Support

Bei Fragen oder Problemen: Kontaktiere den Support über contact.html
