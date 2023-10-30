const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// กำหนดไดเรกทอรีที่เก็บรูปภาพ
router.use(express.static(path.join(__dirname, 'uploads')));

// อื่นๆ ที่คุณมีอาจจะต้องกำหนดแบบเดียวกัน

router.get('/uploads/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  console.log(deviceId);
  const uploadsFileName = deviceId + '.png'; // สร้างชื่อไฟล์ด้วย deviceId
  const filePath = path.join(__dirname, 'uploads', uploadsFileName);

  // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // ถ้าไม่มีข้อมูล ส่งสถานะ 404 (Not Found)
      res.status(404).send('File not found');
    } else {
      // ถ้ามีข้อมูล ส่งไฟล์กลับ
      res.sendFile(filePath);
    }
  });
});

// อื่นๆ ที่คุณมีอาจจะต้องกำหนดแบบเดียวกัน
module.exports = router;
