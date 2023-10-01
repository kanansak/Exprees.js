// post.js

const express = require('express');
const router = express.Router();
const db = require('./db');

// API Endpoint สำหรับการสร้างข้อมูลใหม่
router.post('/data', (req, res) => {
  const { device_id, voltage, current, power, energy, frequency, pf } = req.body;
  const query = 'INSERT INTO ESP_DATA (device_id, voltage, current, power, energy, frequency, pf, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';

  // ตรวจสอบว่าทุกค่าถูกส่งมาในคำขอหรือไม่
  if (!device_id || !voltage || !current || !power || !energy || !frequency || !pf) {
    res.status(400).json({ message: 'กรุณากรอกข้อมูลทั้งหมด' });
    return;
  }

  db.query(query, [device_id, voltage, current, power, energy, frequency, pf], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + err.message);
      res.status(500).send('เกิดข้อผิดพลาดในการสร้างข้อมูล');
      return;
    }

    res.json({ message: 'ข้อมูลถูกสร้างเรียบร้อย' });
  });
});

module.exports = router;
