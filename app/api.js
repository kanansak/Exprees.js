const express = require('express');
const db = require('../config/db.config');
const router = express.Router();

// API Endpoint สำหรับการดึงข้อมูลทั้งหมด
router.get('/data', (req, res) => {
    const query = 'SELECT * FROM ESP_DATA'; // แทน ESP_DATA ด้วยชื่อตารางของคุณ
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }
  
      res.json(results);
    });
  });
    // API Endpoint สำหรับการดึงข้อมูลโดยใช้คำสั่ง GET
router.get('/data/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM ESP_DATA WHERE id = ?'; // แทน ESP_DATA ด้วยชื่อตารางของคุณ

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
      return;
    }

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (result.length === 0) {
      res.status(404).json({ message: 'ไม่พบข้อมูลที่ต้องการ' });
      return;
    }

    res.json(result[0]); // ส่งข้อมูลแรกที่พบ
  });
});

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



  
router.put('/data/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  // อัปเดตคอลัมน์ updated_at ในข้อมูลที่จะอัปเดต
  updatedData.updated_at = new Date();

  // Update data in MySQL
  db.query('UPDATE ESP_DATA SET ? WHERE id = ?', [updatedData, id], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้' });
      return;
    }
    console.log('อัปเดตข้อมูลสำเร็จ');
    res.status(200).json({ message: 'อัปเดตข้อมูลสำเร็จ' });
  });
});






  
  // API Endpoint สำหรับการลบข้อมูล
  router.delete('/data/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM ESP_DATA WHERE id=?'; // แทน ESP_DATA ด้วยชื่อตารางของคุณ
  
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
        return;
      }
  
      res.json({ message: 'ข้อมูลถูกลบเรียบร้อย' });
    });
  });
  

  module.exports = router;