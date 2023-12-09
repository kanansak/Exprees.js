const express = require('express');
const db = require('../db');
const router = express.Router();
//ข้อมูลพลังงานอุปกรณ์ รายเดือน ปัจจุบัน
router.get('/energy_month', (req, res) => {
    const device_id = req.query.device_id; // Use req.query to get the device_id
  
    const today = new Date(); // Get current date
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0); // Start of current month at 00:00:00
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0); // Start of next month at 00:00:00

    startOfNextMonth.setSeconds(startOfNextMonth.getSeconds() - 1); // Set to the last second of the current month

  
    const queryESP = `
      SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
      FROM Data_ESP
      WHERE device_id = ? AND created_timestamp >= ? AND created_timestamp < ?
      GROUP BY device_id, FLOOR(TIMESTAMPDIFF(DAY, '1970-01-01', created_timestamp) )
    `;
  
    const queryTuya = `
      SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
      FROM Data_Tuya
      WHERE device_id = ? AND created_timestamp >= ? AND created_timestamp < ?
      GROUP BY device_id, FLOOR(TIMESTAMPDIFF(DAY, '1970-01-01', created_timestamp) )
    `;
  
    const combinedData = [];
  
    db.query(queryESP, [device_id, startOfMonth, startOfNextMonth], (errESP, resultESP) => {
      if (errESP) {
        console.error('Error fetching Data_ESP: ' + errESP.message);
        res.status(500).json({ message: 'Error fetching Data_ESP' });
        return;
      }
  
      combinedData.push(...resultESP.map(row => ({
        device_id: row.device_id,
        energy: row.energy,
        created_timestamp: row.created_timestamp.toISOString(), // Format the timestamp as ISO string
      })));
  
      db.query(queryTuya, [device_id, startOfMonth, startOfNextMonth], (errTuya, resultTuya) => {
        if (errTuya) {
          console.error('Error fetching Data_Tuya: ' + errTuya.message);
          res.status(500).json({ message: 'Error fetching Data_Tuya' });
          return;
        }
  
        combinedData.push(...resultTuya.map(row => ({
          device_id: row.device_id,
          energy: row.energy,
          created_timestamp: row.created_timestamp.toISOString(), // Format the timestamp as ISO string
        })));
  
        res.json(combinedData);
      });
    });
  });

module.exports = router;