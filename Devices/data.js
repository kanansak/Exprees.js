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


router.get('/latest_data', (req, res) => {
  const device_id = req.query.device_id;
  const queryESP = 'SELECT * FROM Data_ESP WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';
  const queryTuya = 'SELECT * FROM Data_Tuya WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';

  const response = {};

  db.query(queryESP, [device_id], (errESP, resultESP) => {
      if (!errESP && resultESP.length > 0) {
          response.esp = resultESP[0];
      }

      db.query(queryTuya, [device_id], (errTuya, resultTuya) => {
          if (!errTuya && resultTuya.length > 0) {
              response.tuya = resultTuya[0];
          }

          res.json(response);
      });
  });
});

// GET Data by device_id
router.get('/data', (req, res) => {
  const device_id = req.query.device_id; // Use req.query to get the device_id

  const queryESP = 'SELECT device_id, energy, created_timestamp FROM Data_ESP WHERE device_id = ?';
  const queryTuya = 'SELECT * FROM Data_Tuya WHERE device_id = ?';

  const combinedData = {};

  db.query(queryESP, [device_id], (errESP, resultESP) => {
    if (errESP) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Data_ESP: ' + errESP.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Data_ESP' });
      return;
    }

    combinedData.Data_ESP = resultESP;

    db.query(queryTuya, [device_id], (errTuya, resultTuya) => {
      if (errTuya) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Data_Tuya: ' + errTuya.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Data_Tuya' });
        return;
      }

      combinedData.Data_Tuya = resultTuya;
      res.json(combinedData);
    });
  });
});



module.exports = router;
//latest_data_esp?device_id=your_device_id
//latest_data_tuya?device_id=your_device_id
//http://localhost:3000/latest_data_esp?device_id=ESP-001
//http://localhost:3000/latest_data?device_id=ESP-002