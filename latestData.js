const express = require('express');
const db = require('./db');
const router = express.Router();

// สร้าง API Endpoint เพื่อดึงข้อมูลล่าสุดโดยอ้างอิงตาม device_id
router.get('/latestData', (req, res) => {
  const { device_id } = req.query; // รับค่า device_id จากคำขอ HTTP

  if (!device_id) {
    return res.status(400).json({ error: 'กรุณาระบุ device_id' });
  }

  const query = 'SELECT * FROM ESP_DATA WHERE device_id = ? ORDER BY created_at DESC LIMIT 1';

  // ดึงข้อมูลจากฐานข้อมูล MySQL
  db.query(query, [device_id], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (results.length === 0) {
      res.status(404).json({ error: 'ไม่พบข้อมูล' });
      return;
    }

    // ส่งข้อมูลล่าสุดเป็น JSON
    res.json(results[0]);
  });
});

module.exports = router;

//http://localhost:3000/latestData?device_id=ESP-001