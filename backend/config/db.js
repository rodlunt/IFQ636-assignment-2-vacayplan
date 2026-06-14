// config/db.js
// DESIGN PATTERN - SINGLETON - Guarantees the application holds exactly one
// shared MongoDB connection. The Database class cannot be instantiated twice:
// all access goes through Database.getInstance(), and connect() reuses the
// existing connection on every call after the first instead of re-initialising.

const mongoose = require("mongoose");

class Database {
  constructor() {
    // Singleton guard: direct construction is refused once the single
    // instance exists - getInstance() is the only supported entry point.
    if (Database.instance) {
      throw new Error("Database is a singleton - use Database.getInstance()");
    }
    this.connectionPromise = null;
    Database.instance = this;
  }

  // Single global access point. First call creates the one instance;
  // every later call returns that same instance.
  static getInstance() {
    if (!Database.instance) {
      new Database();
    }
    return Database.instance;
  }

  // Re-initialisation guard: the first call starts the Mongoose connection
  // and stores the promise; repeat calls return the same stored promise, so
  // the process can never open a second connection to the database.
  connect() {
    if (!this.connectionPromise) {
      this.connectionPromise = mongoose.connect(process.env.MONGO_URI);
    }
    return this.connectionPromise;
  }
}

// Existing entry point kept so server.js is unchanged: connectDB() now
// delegates to the singleton rather than calling mongoose.connect directly.
const connectDB = async () => {
  try {
    await Database.getInstance().connect();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.Database = Database;
