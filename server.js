// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());

// กำหนดการเชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: 'siamdev.info',    // เปลี่ยนตาม host ของ MySQL ของคุณ
  user: 'mon',     // เปลี่ยนเป็นชื่อผู้ใช้ MySQL ของคุณ
  password: 'mon', // เปลี่ยนเป็นรหัสผ่าน MySQL ของคุณ
  database: 'mon'    // เปลี่ยนเป็นชื่อฐานข้อมูลที่คุณต้องการเชื่อมต่อ
});

// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MySQL: ' + err.message);
  } else {
    console.log('เชื่อมต่อกับ MySQL สำเร็จ');
  }
});

// สร้างเส้นทาง GET
app.get('/', (req, res) => {
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

// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});
