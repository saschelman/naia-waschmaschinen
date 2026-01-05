require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret:
    process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production",
  dbPath: process.env.DB_PATH || "./database.db",
  environment: process.env.NODE_ENV || "development",
};
