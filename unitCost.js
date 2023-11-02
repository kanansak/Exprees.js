// post.js

const express = require('express');
const router = express.Router();
const db = require('./db');

// API Endpoint สำหรับการสร้างข้อมูลใหม่
router.put('/postUnitCost', (req, res) => {
  const { unitCost } = req.body;
  const query = 'Update unitCost set unitCost = ?';

  db.query(query, [unitCost], (err, result) => {
    if (err) {
      console.error(' UnitCostPostเกิดข้อผิดพลาดสร้าง: ' + err.message);
      res.status(500).send('UnitCostPOstเกิดข้อผิดพลาดในการสร้างข้อมูล');
      return;
    }

    res.json({ message: 'UnitCostข้อมูลUpdateเรียบร้อย' });
  });
});

router.get('/getUnitCost',(req,res)=>{
    const{unitCost}=req.body;
    const query = 'Select unitCost (unitCost) Values(?)';

    db.query(query, [unitCost], (err, result) => {
        if (err) {
          console.error(' UnitCostGetเกิดข้อผิดพลาดสร้าง: ' + err.message);
          res.status(500).send('UnitCostGetเกิดข้อผิดพลาดในการสร้างข้อมูล');
          return;
        }
    
        res.json({ message: 'UnitCostข้อมูลถูกสร้างเรียบร้อย' });
      });

});

module.exports = router;
