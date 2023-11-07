const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // นำเข้าไฟล์การเชื่อมต่อ MySQL

// รับข้อมูล JSON จาก body ของคำขอ
router.use(express.json());

router.post('/register', (req, res) => {
  const { name, lname, email, password } = req.body;

  if (!name || !lname || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Bcrypt error:', err);
      res.status(500).json({ error: 'Registration failed' });
    } else {
      const insertQuery = 'INSERT INTO users (name, lname, email, password) VALUES (?, ?, ?, ?)';
      const values = [name, lname, email, hashedPassword];

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
            const { id, name, role, level, group } = results[0];
            const token = generateToken(id);
            res.json({ message: 'Login successful', token, name, email, role, level, group });
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


router.get('/profile/:email', (req, res) => {
  const email = req.params.email;

  const sql = 'SELECT id, name ,lname , email, role, level, `group` FROM users WHERE email = ?'; // Replace "username" with the correct column name
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error fetching user data by email: ' + err.message);
      res.status(500).send('Error fetching user data by email');
    } else if (result.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result[0]);
    }
  });
});



function generateToken(userId) {
  const secretKey = 'your-secret-key'; // เปลี่ยนเป็นคีย์ลับของคุณ
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
  return token;
}

module.exports = router;
