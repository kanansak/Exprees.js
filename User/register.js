// register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Import your database connection

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      namef: name,
      email_address: email,
      password: hashedPassword,
    };

    const query = 'INSERT INTO users (namef, email_address, password) VALUES (?, ?, ?)';
    const values = [userData.namef, userData.email_address, userData.password];

    const [results, fields] = await db.query(query, values);

    if (results.insertId) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error registering user: ' + error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
