// signin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const secretKey = 'your_secret_key'; // Replace with your secret key

// Assuming you have a database connection in db.js
const db = require('../db');

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results, fields] = await db.query('SELECT id, namef, password FROM users WHERE email = ? LIMIT 0, 1', [email]);

    if (results.length > 0) {
      const user = results[0];
      const { user_id, namef, password: hashedPassword } = user;

      const passwordsMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordsMatch) {
        const token = jwt.sign(
          {
            user_id,
            userEmail: email,
          },
          secretKey,
          {
            expiresIn: '1h', // Token expires in 1 hour
          }
        );

        res.json({
          message: 'Success',
          id: user_id,
          token,
          email: email,
          expiry: Math.floor(Date.now() / 1000) + 3600, // Token expiry in Unix timestamp format
        });
      } else {
        res.status(401).json({ message: 'Authentication failed' });
      }
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error executing the SQL query: ' + error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
