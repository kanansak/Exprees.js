// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());
app.use(express.json());

// เก็บข้อมูลผู้ใช้งานที่อนุญาตและข้อมูล Role
const users = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'user@example.com', password: 'user123', role: 'user' }
];
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ role: user.role });
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
});


const signinRoute = require('./User/signin');
app.use('/api', signinRoute);
const registerRoute = require('./User/register');
app.use('/api', registerRoute);
const getRoutes = require('./Devices/latestData');
app.use(getRoutes);

// นำเส้นทาง CRUD ของผู้ใช้งานมาใช้
 const userRoutes = require('./User/api-user'); // นำเข้าไฟล์ CRUD ของผู้ใช้งาน
 app.use(userRoutes);


//http://localhost:3000/devices/
//const deviceRouter = require('./Devices/api-device')
//app.use(deviceRouter);

const pushImage = require('./push-image');
app.use(pushImage);

const uploadFileRouter = require('./upload-file');
app.use(uploadFileRouter);


//http://localhost:3000/devices
const datadevice = require('./Devices/data-device')
app.use(datadevice);


//http://localhost:3000/data_esp
const data =require('./Devices/data')
app.use(data);


// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});