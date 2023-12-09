const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/energy_years', (req, res) => {
    const device_id = req.query.device_id; // Use req.query to get the device_id
  
    const today = new Date(); // Get current date
    const startOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0); // Start of current year at 00:00:00
    const startOfNextYear = new Date(today.getFullYear() + 1, 0, 1, 0, 0, 0); // Start of next year at 00:00:00
  
    startOfNextYear.setSeconds(startOfNextYear.getSeconds() - 1); // Set to the last second of the current year
  
    const queryESP = `
      SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
      FROM Data_ESP
      WHERE device_id = ? AND created_timestamp >= ? AND created_timestamp < ?
      GROUP BY device_id, YEAR(created_timestamp), MONTH(created_timestamp)
    `;
  
    const queryTuya = `
      SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
      FROM Data_Tuya
      WHERE device_id = ? AND created_timestamp >= ? AND created_timestamp < ?
      GROUP BY device_id, YEAR(created_timestamp), MONTH(created_timestamp)
    `;
  
    const combinedData = [];
  
    db.query(queryESP, [device_id, startOfYear, startOfNextYear], (errESP, resultESP) => {
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
  
      db.query(queryTuya, [device_id, startOfYear, startOfNextYear], (errTuya, resultTuya) => {
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