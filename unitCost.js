// post.js

const express = require('express');
const router = express.Router();
const db = require('./db');

// API Endpoint สำหรับการสร้างข้อมูลใหม่
router.put('/putUnitCost/:id', (req, res) => {
  const { id } = req.params;
  const { unitCost } = req.body;
  const query = 'UPDATE unitcost SET unitcost = ? WHERE id = ?';

  db.query(query, [unitCost, id], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดต UnitCost: ' + err.message);
      res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตข้อมูล UnitCost');
      return;
    }

    res.json({ message: 'ข้อมูล UnitCost ได้ถูกอัปเดตเรียบร้อย' });
  });
});


router.get('/getUnitCost',(req,res)=>{
    const{unitCost}=req.body;
    const query = 'SELECT * FROM unitcost';

    db.query(query, (err, result) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
          res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
          return;
        }
    
        res.json(result);
      });
});


module.exports = router;
