// นำเข้า Express และ MySQL module
const express = require('express');
const cors = require('cors');
const cookieSession = require("cookie-session");

// สร้าง Express application
const app = express();

// ใช้ middleware CORS ใน Express
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync({force: true}).then(() => {
  console.log('Drop and Resync Db');
  initial();
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "moderator"
  });
 
  Role.create({
    id: 3,
    name: "admin"
  });
}

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
// routes
require('./app/routes/auth.routes').default(app);
require('./app/routes/user.routes').default(app);

const getRoutes = require('./app/Devices/latestData');
app.use(getRoutes);

// นำเส้นทาง CRUD ของผู้ใช้งานมาใช้
 const userRoutes = require('./app/User/api-user'); // นำเข้าไฟล์ CRUD ของผู้ใช้งาน
 app.use(userRoutes);


//http://localhost:3000/devices/
//const deviceRouter = require('./Devices/api-device')
//app.use(deviceRouter);


//http://localhost:3000/devices
const datadevice = require('./app/Devices/data-device')
app.use(datadevice);


//http://localhost:3000/data_esp
const data =require('./app/Devices/data')
app.use(data);


// รัน Express server ที่พอร์ตที่คุณต้องการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
});