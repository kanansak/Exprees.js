const mysql = require('mysql');

// กำหนดการเชื่อมต่อกับ MySQL
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

module.exports = db;
