const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const xlsx = require("xlsx");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// Connect to SQLite
const db = new sqlite3.Database("database.db", (err) => {
    if (err) console.error("Database connection failed", err);
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

// User Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (user) {
            if (user.isAdmin) return res.json({ admin: true });
            db.run("INSERT INTO logs (user_id, login_time) VALUES (?, ?)", [user.id, new Date().toISOString()]);
            res.json({ success: true, userId: user.id });
        } else {
            res.json({ success: false });
        }
    });
});

// User Logout
app.post("/logout", (req, res) => {
    const { userId } = req.body;
    db.run("UPDATE logs SET logout_time = ? WHERE user_id = ? AND logout_time IS NULL", [new Date().toISOString(), userId], (err) => {
        if (!err) res.json({ success: true });
    });
});

// Admin - Get User Logs
app.get("/logs", (req, res) => {
    db.all("SELECT users.username, logs.* FROM logs JOIN users ON logs.user_id = users.id", [], (err, logs) => {
        res.json(logs);
    });
});

// Admin - Create User
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
        res.json({ success: !err });
    });
});

// Export to Excel
app.get("/export", (req, res) => {
    db.all("SELECT users.username, logs.login_time, logs.logout_time FROM logs JOIN users ON logs.user_id = users.id", [], (err, logs) => {
        const worksheet = xlsx.utils.json_to_sheet(logs);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Logs");

        const filePath = "logs.xlsx";
        xlsx.writeFile(workbook, filePath);
        res.download(filePath);
    });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
