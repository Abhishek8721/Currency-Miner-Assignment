const sqlite3 = require('sqlite3').verbose();

// Open SQLite database
const db = new sqlite3.Database('mining_system.db', (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });
  

// Create mining table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS mining (
    user_id INTEGER,
    start_time DATETIME,
    accumulated_coins INTEGER DEFAULT 0,
    last_claim_time DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error("Error creating 'mining' table: " + err.message);
  }
});

// Function to delete all data from all tables (retaining the schema)
function deleteAllData() {
  db.serialize(() => {
    db.run('DELETE FROM users', (err) => {
      if (err) {
        console.error("Error deleting data from 'users' table: " + err.message);
      } else {
        console.log("All data deleted from 'users' table.");
      }
    });
    
    db.run('DELETE FROM mining', (err) => {
      if (err) {
        console.error("Error deleting data from 'mining' table: " + err.message);
      } else {
        console.log("All data deleted from 'mining' table.");
      }
    });
  });
}

// Function to drop all tables (removes both data and schema)
function dropAllTables() {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS users', (err) => {
      if (err) {
        console.error("Error dropping 'users' table: " + err.message);
      } else {
        console.log("Dropped 'users' table.");
      }
    });
    
    db.run('DROP TABLE IF EXISTS mining', (err) => {
      if (err) {
        console.error("Error dropping 'mining' table: " + err.message);
      } else {
        console.log("Dropped 'mining' table.");
      }
    });
  });
}

// Example: Call deleteAllData() to clear all data from tables
// deleteAllData();

// Example: Call dropAllTables() to completely remove all tables and schema
// dropAllTables();

module.exports = db;
