// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());
app.use(express.json());


const getRoutes = require('./Devices/latestData');
app.use(getRoutes);


// นำเส้นทาง CRUD ของผู้ใช้งานมาใช้
 const userRoutes = require('./User/api-user'); // นำเข้าไฟล์ CRUD ของผู้ใช้งาน
 app.use(userRoutes);


//http://localhost:3000/devices/
const deviceRouter = require('./Devices/api-device')
app.use(deviceRouter);


//http://localhost:3000/devices
const datadevice = require('./Devices/data-device')
app.use('test',datadevice);


//http://localhost:3000/data_esp
const data =require('./Devices/data')
app.use(data);


// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});