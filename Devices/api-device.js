const express = require('express');
const db = require('../db');
const router = express.Router();

// CREATE (POST)
router.post('/devices', (req, res) => {
  const { ESP_id, device_name, device_detail, device_location } = req.body;
  const query = 'INSERT INTO Device_ESP (ESP_id, device_name, device_detail, device_location, created_timestamp, modified_timestamp) VALUES (?, ?, ?, ?, NOW(), NOW())';

  // แทนค่า null ถ้าข้อมูลเป็น null
  const values = [ESP_id || null, device_name || null, device_detail || null, device_location || null];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + err.message);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างข้อมูล' });
    }

    return res.json({ message: 'ข้อมูลถูกสร้างเรียบร้อย' });
  });
});


  
  // READ (GET all devices)
  router.get('/devices', (req, res) => {
    const query = 'SELECT * FROM Device_ESP';
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }
  
      res.json(result);
    });
  });
  
  // READ (GET device by ID)
  router.get('/devices/:ESP_id', (req, res) => {
    const deviceId = req.params.ESP_id;
    const query = 'SELECT * FROM Device_ESP WHERE ESP_id = ?';
  
    db.query(query, [deviceId], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }
  
      if (result.length === 0) {
        res.status(404).json({ message: 'ไม่พบข้อมูลอุปกรณ์ที่ระบุ' });
        return;
      }
  
      res.json(result[0]);
    });
  });
  
  // UPDATE (PUT)
  router.put('/devices/:ESP_id', (req, res) => {
    const ESP_id = req.params.ESP_id;
    const { device_name, device_detail, device_location } = req.body;
    const query = 'UPDATE Device_ESP SET device_name = ?, device_detail = ?, device_location = ?, modified_timestamp = NOW() WHERE ESP_id = ?';

    if (!device_name || !device_detail || !device_location) {
        res.status(400).json({ message: 'กรุณากรอกข้อมูลทั้งหมด' });
        return;
    }

    db.query(query, [device_name, device_detail, device_location, ESP_id], (err, result) => {
        if (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        return;
        }

        if (result.affectedRows === 0) {
        res.status(404).json({ message: 'ไม่พบข้อมูลอุปกรณ์ที่ระบุ' });
        return;
        }

        res.json({ message: 'ข้อมูลถูกอัปเดตเรียบร้อย' });
    });
  });
  
  // DELETE (DELETE)
  router.delete('/devices/:ESP_id', (req, res) => {
    const ESP_id = req.params.ESP_id;
    const query = 'DELETE FROM Device_ESP WHERE ESP_id = ?';
  
    db.query(query, [ESP_id], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'ไม่พบข้อมูลอุปกรณ์ที่ระบุ' });
        return;
      }
  
      res.json({ message: 'ข้อมูลถูกลบเรียบร้อย' });
    });
  });


// READ (GET measurements by Device_ESP ESP_id with join)
router.get('/devices/:esp_id/measurements', (req, res) => {
  const espId = req.params.esp_id;
  const query = `
    SELECT Measurement_ESP.*, Device_ESP.ESP_id
    FROM Measurement_ESP
    INNER JOIN Device_ESP ON Measurement_ESP.device_ESP_id = Device_ESP.id
    WHERE Device_ESP.ESP_id = ?
  `;

  db.query(query, [espId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
      return;
    }

    res.json(result);
  });
});

  

  


module.exports = router;