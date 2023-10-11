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

// GET Latest Data_ESP
router.get('/latest_data_esp', (req, res) => {
    const query = 'SELECT * FROM Data_ESP ORDER BY created_timestamp DESC LIMIT 1';
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_ESP: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_ESP' });
        return;
      }
  
      res.json(result[0]); // รายการแรกคือข้อมูลล่าสุด
    });
  });
  
  // GET Latest Data_Tuya
  router.get('/latest_data_tuya', (req, res) => {
    const query = 'SELECT * FROM Data_Tuya ORDER BY created_timestamp DESC LIMIT 1';
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_Tuya: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด Data_Tuya' });
        return;
      }
  
      res.json(result[0]); // รายการแรกคือข้อมูลล่าสุด
    });
  });
  
module.exports = router;
