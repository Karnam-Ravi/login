const express = require("express");
const { registerUser, loginUser, logUserIn, logUserOut, getLogs } = require("./models");
const { exportToExcel } = require("./utils");

const router = express.Router();

// Register user
router.post("/register", (req, res) => {
    const { username, password } = req.body;
    registerUser(username, password, (err) => {
        res.json({ success: !err });
    });
});

// Login user
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    loginUser(username, password, (err, user) => {
        if (user) {
            if (user.isAdmin) return res.json({ admin: true });
            logUserIn(user.id, () => res.json({ success: true, userId: user.id }));
        } else {
            res.json({ success: false });
        }
    });
});

// Logout user
router.post("/logout", (req, res) => {
    const { userId } = req.body;
    logUserOut(userId, () => res.json({ success: true }));
});

// Get logs
router.get("/logs", (req, res) => {
    getLogs((err, logs) => res.json(logs));
});

// Export logs to Excel
router.get("/export", (req, res) => {
    exportToExcel((filePath) => res.download(filePath));
});

module.exports = router;
