const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const config = require("./config");

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Fehler beim Verbinden mit der Datenbank:", err);
  } else {
    console.log("✅ Mit SQLite Datenbank verbunden");
  }
});

// Datenbank initialisieren
const initializeDatabase = () => {
  db.serialize(() => {
    // Users Tabelle erstellen
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isVerified INTEGER DEFAULT 0,
        verificationToken TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          console.error("Fehler beim Erstellen der users Tabelle:", err);
        } else {
          console.log("✅ Users Tabelle initialisiert");
        }
      }
    );
  });
};

// Helper-Funktionen für Datenbank-Operationen
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery,
};
