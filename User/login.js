const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // นำเข้าไฟล์การเชื่อมต่อ MySQL

// รับข้อมูล JSON จาก body ของคำขอ
router.use(express.json());

router.post('/register', (req, res) => {
  const { email, password ,role} = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Bcrypt error:', err);
      res.status(500).json({ error: 'Registration failed' });
    } else {
      const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
      const values = [email, hashedPassword,role];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          res.status(500).json({ error: 'Registration failed' });
        } else {
          res.json({ message: 'Registration successful' });
        }
      });
    }
  });
});
///
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const selectQuery = 'SELECT * FROM users WHERE email = ?';
  const values = [email];

  db.query(selectQuery, values, (err, results) => {
    if (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    } else {
      if (results.length === 1) {
        bcrypt.compare(password, results[0].password, (err, passwordMatch) => {
          if (passwordMatch) {
            const token = generateToken(results[0].id);
            res.json({ message: 'Login successful', token, role: results[0].role });
          } else {
            res.status(401).json({ error: 'Login failed' });
          }
        });
      } else {
        res.status(401).json({ error: 'Login failed' });
      }
    }
  });
});


function generateToken(userId) {
  const secretKey = 'your-secret-key'; // เปลี่ยนเป็นคีย์ลับของคุณ
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
  return token;
}

module.exports = router;
