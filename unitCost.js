// post.js

const express = require('express');
const router = express.Router();
const db = require('./db');

// API Endpoint สำหรับการสร้างข้อมูลใหม่
router.put('/putUnitCost', (req, res) => {
  const { unitCost } = req.body;
  const query = 'Update unitCost set unitCost = ?';

  db.query(query, [unitCost], (err, result) => {
    if (err) {
      console.error(' UnitCostPutเกิดข้อผิดพลาดสร้าง: ' + err.message);
      res.status(500).send('UnitCostPutเกิดข้อผิดพลาดในการสร้างข้อมูล');
      return;
    }

    res.json({ message: 'UnitCostข้อมูลUpdateเรียบร้อย' });
  });
});

router.get('/getUnitCost',(req,res)=>{
    const{unitCost}=req.body;
    const query = 'SELECT * FROM unitCost';

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
