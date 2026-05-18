const express = require('express');
const router = express.Router();

// Fake user data for demonstration
const validUser = { username: 'user', password: 'pass' };

// Render login page (static HTML)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle login (POST)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === validUser.username && password === validUser.password) {
        req.session.user = validUser; // Save user to session
        return res.redirect('/index');
    }
    
    // If login fails, redirect back to login page
    res.redirect('/index');
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/index.html'); // Redirect to the static login page
    });
});

// Protected route (e.g., dashboard)
router.get('/index', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/index.html');
    }
    
    res.render('index', { user: req.session.user });
});

module.exports = router;
