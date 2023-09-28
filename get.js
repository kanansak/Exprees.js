const express = require('express');
const db = require('./db');
const router = express.Router();

// เส้นทาง GET '/get-route'
router.get('/get-route', (req, res) => {
  //res.send('นี่คือเส้นทาง GET ในไฟล์ get.js');
    // ทำคำสั่ง SQL ของคุณที่นี่และส่งผลลัพธ์กลับไปให้กับผู้ใช้
    db.query('SELECT * FROM ESP_DATA', (err, results) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการสอบถามฐานข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการสอบถามฐานข้อมูล');
      } else {
        res.json(results); // ส่งข้อมูลในรูปแบบ JSON กลับไปให้กับผู้ใช้
      }
    });
});

module.exports = router;
