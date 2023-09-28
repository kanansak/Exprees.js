// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());
app.use(express.json());


// นำเส้นทาง GET จากไฟล์ get.js
const getRoutes = require('./get');
app.use(getRoutes);

// นำเส้นทาง POST จากไฟล์ post.js
const postRoutes = require('./post'); // ต้องเป็นตำแหน่งของไฟล์ post.js จริง
app.use(postRoutes); // กำหนดเส้นทางที่จะเชื่อมกับ postRoutes ในที่นี้คือ '/post-route'

// นำเส้นทาง CRUD ของผู้ใช้งานมาใช้
const userRoutes = require('./user'); // นำเข้าไฟล์ CRUD ของผู้ใช้งาน
app.use('/api', userRoutes);


// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});