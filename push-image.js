const express = require('express');
const router = express.Router();
const path = require('path');

// กำหนดไดเรกทอรีที่เก็บรูปภาพ
router.use(express.static(path.join(__dirname, 'uploads')));

// อื่นๆ ที่คุณมีอาจจะต้องกำหนดแบบเดียวกัน

router.get('/uploads/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  console.log(deviceId);
  const uploadsFileName = deviceId + '.png'; // สร้างชื่อไฟล์ด้วย deviceId
  res.sendFile(path.join(__dirname, 'uploads', uploadsFileName));

});

// อื่นๆ ที่คุณมีอาจจะต้องกำหนดแบบเดียวกัน
module.exports = router;
