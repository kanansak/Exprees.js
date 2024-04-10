// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'final-project')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/device-component', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/profile-component', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/login-component', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
app.get('/about-component', (req, res) => {
  res.sendFile(path.join(__dirname, 'final-project', 'index.html'));
});
// const getRoutes = require('./Devices/latestData');
// app.use(getRoutes);

// นำเส้นทาง CRUD ของผู้ใช้งานมาใช้
 const userRoutes = require('./User/api-user'); // นำเข้าไฟล์ CRUD ของผู้ใช้งาน
 app.use(userRoutes);


//http://localhost:3000/devices/
//const deviceRouter = require('./Devices/api-device')
//app.use(deviceRouter);

const pushImage = require('./image/push-image');
app.use(pushImage);

const groups = require('./Group/group');
app.use(groups);

const uploadFileRouter = require('./image/upload-file');
app.use(uploadFileRouter);

const uploadFileRouterIcon = require('./image/upload-file-icon');
app.use(uploadFileRouterIcon);


//http://localhost:3000/devices
const datadevice = require('./Devices/data-device')
app.use(datadevice);


const unitCost = require('./unitCost')
app.use(unitCost);



//http://localhost:3000/data_esp
const data =require('./Devices/data')
app.use(data);

const dataMouth =require('./Devices/data-mouth')
app.use(dataMouth);

const dataYears =require('./Devices/data-years')
app.use(dataYears);

const userlogin = require('./User/login')
app.use('/api',userlogin);

const inputdata = require('./api')
app.use('/api',inputdata)
// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});