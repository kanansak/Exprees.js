
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})
const connection = mysql.createConnection({
    host: 'http://siamdev.info:8081/',
    user : 'mon',
    password :'mon',
    database : "mon",
    port: '3306'
  });
  Connection.connect((err) => {
    if(err){
        console.log('Error connection to Mysql database = ',err)
        return;
    }
    console.log('Mysql successfully connected');
})

// สร้างการเปิดเส้นทาง GET
// นำเส้นทาง GET จากไฟล์ get.js
const getRoutes = require('./get');
app.use(getRoutes);

// นำเส้นทาง POST จากไฟล์ post.js
const postRoutes = require('./post');
app.use(postRoutes);


app.listen(3000, () => {
  console.log('Start server at port 3000.')
})