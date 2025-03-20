const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

// Initialize tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        isAdmin INTEGER DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        login_time TEXT,
        logout_time TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// Register new user
const registerUser = (username, password, callback) => {
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], callback);
};

// Login user
const loginUser = (username, password, callback) => {
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], callback);
};

// Record login time
const logUserIn = (userId, callback) => {
    db.run("INSERT INTO logs (user_id, login_time) VALUES (?, ?)", [userId, new Date().toISOString()], callback);
};

// Record logout time
const logUserOut = (userId, callback) => {
    db.run("UPDATE logs SET logout_time = ? WHERE user_id = ? AND logout_time IS NULL", [new Date().toISOString(), userId], callback);
};

// Get logs
const getLogs = (callback) => {
    db.all("SELECT users.username, logs.* FROM logs JOIN users ON logs.user_id = users.id", [], callback);
};

module.exports = { registerUser, loginUser, logUserIn, logUserOut, getLogs };
