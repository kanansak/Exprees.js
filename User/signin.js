// signin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const secretKey = '1234'; // Replace with your secret key
const issuerClaim = 'localhost';
const audienceClaim = 'THE_AUDIENCE';

// Assuming you have a database connection in db.js
const db = require('../db');

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results, fields] = await db.query('SELECT id, namef, password FROM users WHERE email = ? LIMIT 0, 1', [email]);

    if (results.length > 0) {
      const user = results[0];
      const { id, namef, password: hashedPassword } = user;

      const passwordsMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordsMatch) {
        const issuedAtClaim = Math.floor(Date.now() / 1000);
        const expireClaim = issuedAtClaim + 3600;

        const token = jwt.sign(
          {
            iss: issuerClaim,
            sub: id,
            aud: audienceClaim,
            iat: issuedAtClaim,
            exp: expireClaim,
            data: {
              id: id,
              userEmail: email,
            }
          },
          secretKey
        );

        res.json({
          message: 'success',
          id: id,
          token,
          email: email,
          expiry: expireClaim,
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
