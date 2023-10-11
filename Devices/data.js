const express = require('express');
const db = require('../db');
const router = express.Router();

// GET Data_ESP (All)
router.get('/data_esp', (req, res) => {
  const query = 'SELECT * FROM Data_ESP';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Data_ESP: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Data_ESP' });
      return;
    }

    res.json(result);
  });
});

// GET Data_Tuya (All)
router.get('/data_tuya', (req, res) => {
  const query = 'SELECT * FROM Data_Tuya';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Data_Tuya: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Data_Tuya' });
      return;
    }

    res.json(result);
  });
});

router.get('/latest_data_esp', (req, res) => {
    const device_id = req.query.device_id; // รับ device_id จากคำขอ HTTP
    const query = 'SELECT * FROM Data_ESP WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';

    db.query(query, [device_id], (err, result) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_ESP: ' + err.message);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_ESP' });
            return;
        }

        res.json(result[0]); // รายการแรกคือข้อมูลล่าสุด
    });
});

router.get('/latest_data_tuya', (req, res) => {
    const device_id = req.query.device_id; // รับ device_id จากคำขอ HTTP
    const query = 'SELECT * FROM Data_Tuya WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';

    db.query(query, [device_id], (err, result) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_Tuya: ' + err.message);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_Tuya' });
            return;
        }

        res.json(result[0]); // รายการแรกคือข้อมูลล่าสุด
    });
});

  
module.exports = router;
//latest_data_esp?device_id=your_device_id
//latest_data_tuya?device_id=your_device_id
//http://localhost:3000/latest_data_esp?device_id=ESP-001