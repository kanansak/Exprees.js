// register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Import your database connection

router.post('/register', async (req, res) => {
  const { email, namef, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      namef: namef,
      email: email,
      password: hashedPassword,
    };

    const query = 'INSERT INTO users (namef, email, password) VALUES (?, ?, ?)';
    const values = [userData.namef, userData.email, userData.password];

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Error registering user: ' + error);
        res.status(500).json({ success: false });
      } else if (results && results.insertId) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  } catch (error) {
    console.error('Error hashing the password: ' + error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
