const express = require('express');
const db = require('../db');
const router = express.Router();
// **หน้า devices**
// ข้อมูลรายเดือน แสดงข้อมูลเป็นทุก 1 วัน
//ข้อมูลพลังงานอุปกรณ์ รายเดือน ปัจจุบัน ใช้แสดงกราฟ
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
      FROM data_tuya
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
          console.error('Error fetching data_tuya: ' + errTuya.message);
          res.status(500).json({ message: 'Error fetching data_tuya' });
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

// **หน้ากลุ่มอุปกรณ์**
//ข้อมูลรายเดือน แสดงข้อมูลเป็นทุก 1 วัน
//ดึงข้อมูลค่าเฉี่ย ค่ารวม โดยอ้างอิงตาม group_name ใช้แสดงเป็นตัวเลข รายเดือน
router.get('/data_by_group_month/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const today = new Date(); // Get current date
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0); // Start of current month at 00:00:00
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0); // Start of next month at 00:00:00

  startOfNextMonth.setSeconds(startOfNextMonth.getSeconds() - 1); // Set to the last second of the current month

  const query = `
    SELECT 
      device_group.group_id,
      DATE_FORMAT(COALESCE(Data_ESP.created_timestamp, data_tuya.created_timestamp), '%Y-%m-%d') AS date,
      AVG(COALESCE(Data_ESP.voltage, data_tuya.voltage)) AS avg_voltage,
      AVG(COALESCE(Data_ESP.current, data_tuya.current)) AS avg_current,
      AVG(COALESCE(Data_ESP.power, data_tuya.power)) AS avg_power,
      SUM(COALESCE(Data_ESP.energy, 0) + COALESCE(data_tuya.energy, 0)) AS total_energy,
      GREATEST(MAX(Data_ESP.created_timestamp), MAX(data_tuya.created_timestamp)) AS latest_timestamp
    FROM device
    INNER JOIN device_group ON device.group_id = device_group.group_id
    LEFT JOIN Data_ESP ON device.device_id = Data_ESP.device_id
    LEFT JOIN data_tuya ON device.device_id = data_tuya.device_id
    WHERE device_group.group_id = ? AND 
          (COALESCE(Data_ESP.created_timestamp, data_tuya.created_timestamp) >= ? AND 
          COALESCE(Data_ESP.created_timestamp, data_tuya.created_timestamp) < ?)
    GROUP BY device_group.group_id, 
             DATE_FORMAT(COALESCE(Data_ESP.created_timestamp, data_tuya.created_timestamp), '%Y-%m-%d')
  `;

  db.query(query, [groupId, startOfMonth, startOfNextMonth], (err, result) => {
    if (err) {
      console.error('Error fetching data: ' + err.message);
      res.status(500).json({ message: 'Error fetching data' });
      return;
    }

    res.json(result);
  });
});
//ดึงข้อมูลทั้งหมด ตาม group_name ใช้แสดงในกราฟ แสดงข้อมูล 1 เดือน ทุก 1วัน แสดงกราฟ
router.get('/all_data_group_month/:group_id', (req, res) => {
    const groupId = req.params.group_id;
  
    const today = new Date(); // Get current date
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0); // Start of current month at 00:00:00
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59); // End of current month at 23:59:59
  
    const query = `
      SELECT SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
      FROM (
        SELECT energy, created_timestamp
        FROM Data_ESP
        WHERE device_id IN (
          SELECT device_id FROM device WHERE group_id = ?
        ) AND created_timestamp >= ? AND created_timestamp <= ?
        
        UNION ALL
        
        SELECT energy, created_timestamp
        FROM data_tuya
        WHERE device_id IN (
          SELECT device_id FROM device WHERE group_id = ?
        ) AND created_timestamp >= ? AND created_timestamp <= ?
      ) AS combined_data
      GROUP BY FLOOR(TIMESTAMPDIFF(DAY, '1970-01-01', created_timestamp))
    `;
  
    db.query(query, [groupId, startOfMonth, endOfMonth, groupId, startOfMonth, endOfMonth], (err, result) => {
      if (err) {
        console.error('Error fetching data: ' + err.message);
        res.status(500).json({ message: 'Error fetching data' });
        return;
      }
  
      // Update the created_timestamp value in each result object
      result.forEach(item => {
        item.created_timestamp = item.created_timestamp; // Update the field name
      });
  
      res.json(result);
    });
  });


//   **หน้า all dashboard**
//ข้อมูลรายเดือน แสดงข้อมูลเป็นทุก 1 วัน
//ข้อมูลรายเดือน แสดงข้อมูลเป็นทุก 1 วัน
//ข้อมูลพลังงานอุปกรณ์ทั้งหมด รายเดือน ปัจจุบัน ใช้แสดงกราฟ
router.get('/all_data_month', (req, res) => {
    const today = new Date(); // Get current date
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0); // Start of current month at 00:00:00
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0); // Start of next month at 00:00:00
  
    startOfNextMonth.setSeconds(startOfNextMonth.getSeconds() - 1); // Set to the last second of the current month
  
    const query = `
      SELECT 
        AVG(voltage) AS avg_voltage,
        AVG(current) AS avg_current,
        AVG(power) AS avg_power,
        SUM(energy) AS energy,
        MAX(created_timestamp) AS created_timestamp
      FROM (
        SELECT voltage, current, power, energy, created_timestamp FROM Data_ESP
        UNION ALL
        SELECT voltage, current, power, energy, created_timestamp FROM data_tuya
      ) AS CombinedData
      WHERE created_timestamp >= ? AND created_timestamp <= ?
      GROUP BY FLOOR(TIMESTAMPDIFF(DAY, '1970-01-01', created_timestamp))
    `;
  
    db.query(query, [startOfMonth, startOfNextMonth], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        return;
      }
  
      res.json(result);
    });
  });
//ดึงข้อมูล ค่าเฉลี่ย ค่ารวม ของทั้งหมด ใช้แสดงเป็นตัวเลข ในเดือนปัจจุบัน
router.get('/sum_data_month', (req, res) => {
  const today = new Date(); // Get current date
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0); // Start of current month at 00:00:00
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59); // End of current month at 23:59:59

  const query = `
    SELECT 
      AVG(voltage) AS avg_voltage,
      AVG(current) AS avg_current,
      AVG(power) AS avg_power,
      SUM(energy) AS total_energy,
      MAX(created_timestamp) AS latest_timestamp
    FROM (
      SELECT voltage, current, power, energy, created_timestamp FROM Data_ESP
      WHERE created_timestamp >= ? AND created_timestamp <= ?
      UNION ALL
      SELECT voltage, current, power, energy, created_timestamp FROM data_tuya
      WHERE created_timestamp >= ? AND created_timestamp <= ?
    ) AS CombinedData
  `;

  db.query(query, [startOfMonth, endOfMonth, startOfMonth, endOfMonth], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    res.json(result[0]); // เนื่องจากมีแค่แถวเดียวจะเลือก index 0 เพื่อส่งผลลัพธ์กลับ
  });
});

module.exports = router;