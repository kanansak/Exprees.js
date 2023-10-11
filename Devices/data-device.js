const express = require('express');
const db = require('../db');
const router = express.Router();

  // CREATE (POST)
  router.post('/devices', (req, res) => {
    const { device_id, device_name, device_detail, device_location, device_map, device_type, group_id } = req.body;
    const query = 'INSERT INTO Device (device_id, device_name, device_detail, device_location, device_map, device_type, group_id, created_timestamp, modified_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  
    // แทนค่า null ถ้าข้อมูลเป็น null
    const values = [device_id || null, device_name || null, device_detail || null, device_location || null, device_map || null, device_type || null, group_id || null];
  
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
    const query = 'SELECT * FROM Device';
  
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
  router.get('/devices/:device_id', (req, res) => {
    const deviceId = req.params.device_id;
    const query = 'SELECT * FROM Device WHERE device_id = ?';
  
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
  router.put('/devices/:device_id', (req, res) => {
    const device_id = req.params.device_id;
    const { device_name, device_detail, device_location, device_map, device_type, group_id } = req.body;
    const query = 'UPDATE Device SET device_name = ?, device_detail = ?, device_location = ?, device_map = ?, device_type = ?, group_id = ?, modified_timestamp = NOW() WHERE device_id = ?';
  
    if (!device_name || !device_detail || !device_location || !device_map || !device_type || !group_id) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลทั้งหมด' });
      return;
    }
  
    db.query(query, [device_name, device_detail, device_location, device_map, device_type, group_id, device_id], (err, result) => {
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
  router.delete('/devices/:device_id', (req, res) => {
    const device_id = req.params.device_id;
    const query = 'DELETE FROM Device WHERE device_id = ?';
  
    db.query(query, [device_id], (err, result) => {
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
  
  // GET Latest Device Data (by unique device_id)
  router.get('/latest_device_data', (req, res) => {
    const query = 'SELECT * FROM Device WHERE (device_id, created_timestamp) IN (SELECT device_id, MAX(created_timestamp) FROM Device GROUP BY device_id)';
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุดจาก Device: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุดจาก Device' });
        return;
      }
  
      res.json(result);
    });
  });
  
  
  
  module.exports = router;
  