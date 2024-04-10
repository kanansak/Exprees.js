const express = require('express');
const multer = require('multer');
const router = express.Router(); // ใช้ express.Router() แทนที่จะใช้ express()

// Create a multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'image/uploads-icon'); // เปลี่ยนเส้นทางไปยัง 'uploads' แทนที่ '/uploads'
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Specify the file name
  },
});

// Create a multer instance with the storage configuration
const upload = multer({ storage: storage });

// Define a route for file uploads
router.post('/upload-icon', upload.single('file'), (req, res) => {
  res.json({ message: 'ICON uploaded successfully' });
});

module.exports = router; // สิ้นสุดไฟล์ด้วยการส่งออก router
