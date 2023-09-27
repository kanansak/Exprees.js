const express = require('express');
const router = express.Router();

// เส้นทาง POST '/post-route'
router.post('/post-route', (req, res) => {
  // การประมวลผลข้อมูลที่ส่งมาใน req.body
  res.send('เพิ่มข้อมูลผู้ใช้งานเรียบร้อย - เส้นทาง POST ในไฟล์ post.js');
});

module.exports = router;
