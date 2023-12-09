const express = require('express');
const db = require('../db');
const router = express.Router();
// **หน้า devices**
//ข้อมูลรายปี แสดงข้อมูลเป็นทุก 1 เดือน
//ข้อมูลพลังงานอุปกรณ์ รายปี ปัจจุบัน แสดงเป็นกราฟ
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

// **หน้ากลุ่มอุปกรณ์**
//ข้อมูลรายปี แสดงข้อมูลเป็นทุก 1 เดือน
//ดึงข้อมูลค่าเฉี่ย ค่ารวม โดยอ้างอิงตาม group_name ใช้แสดงเป็นตัวเลข รายปี
router.get('/data_by_group_years/:group_id', (req, res) => {
    const groupId = req.params.group_id;
  
    const today = new Date(); // Get current date
    const startOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0); // Start of current year at 00:00:00
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59); // End of current year at 23:59:59
  
    const query = `
      SELECT 
        Device_Group.group_id,
        DATE_FORMAT(COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp), '%Y-%m') AS month,
        AVG(COALESCE(Data_ESP.voltage, Data_Tuya.voltage)) AS avg_voltage,
        AVG(COALESCE(Data_ESP.current, Data_Tuya.current)) AS avg_current,
        AVG(COALESCE(Data_ESP.power, Data_Tuya.power)) AS avg_power,
        SUM(COALESCE(Data_ESP.energy, 0) + COALESCE(Data_Tuya.energy, 0)) AS total_energy,
        GREATEST(MAX(Data_ESP.created_timestamp), MAX(Data_Tuya.created_timestamp)) AS latest_timestamp
      FROM Device
      INNER JOIN Device_Group ON Device.group_id = Device_Group.group_id
      LEFT JOIN Data_ESP ON Device.device_id = Data_ESP.device_id
      LEFT JOIN Data_Tuya ON Device.device_id = Data_Tuya.device_id
      WHERE Device_Group.group_id = ? AND 
            (COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp) >= ? AND 
            COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp) <= ?)
      GROUP BY Device_Group.group_id, 
               DATE_FORMAT(COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp), '%Y-%m')
    `;
  
    db.query(query, [groupId, startOfYear, endOfYear], (err, result) => {
      if (err) {
        console.error('Error fetching data: ' + err.message);
        res.status(500).json({ message: 'Error fetching data' });
        return;
      }
  
      res.json(result);
    });
  });
//ดึงข้อมูลทั้งหมด ตาม group_name ใช้แสดงในกราฟ แสดงข้อมูล 1 ปี ทุก 1เดือน แสดงกราฟ
router.get('/all_data_group_years/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const today = new Date(); // Get current date
  const startOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0); // Start of current year at 00:00:00
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59); // End of current year at 23:59:59

  const query = `
    SELECT SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
    FROM (
      SELECT energy, created_timestamp
      FROM Data_ESP
      WHERE device_id IN (
        SELECT device_id FROM Device WHERE group_id = ?
      ) AND created_timestamp >= ? AND created_timestamp <= ?
      
      UNION ALL
      
      SELECT energy, created_timestamp
      FROM Data_Tuya
      WHERE device_id IN (
        SELECT device_id FROM Device WHERE group_id = ?
      ) AND created_timestamp >= ? AND created_timestamp <= ?
    ) AS combined_data
    GROUP BY FLOOR(TIMESTAMPDIFF(MONTH, '1970-01-01', created_timestamp))
  `;

  db.query(query, [groupId, startOfYear, endOfYear, groupId, startOfYear, endOfYear], (err, result) => {
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
//ข้อมูลรายปี แสดงข้อมูลเป็นทุก 1 เดือน
//ข้อมูลพลังงานอุปกรณ์ทั้งหมด รายปี ปัจจุบัน ใช้แสดงกราฟ
router.get('/all_data_years', (req, res) => {
    const today = new Date(); // Get current date
    const startOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0); // Start of current year at 00:00:00
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59); // End of current year at 23:59:59
  
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
        SELECT voltage, current, power, energy, created_timestamp FROM Data_Tuya
        WHERE created_timestamp >= ? AND created_timestamp <= ?
      ) AS CombinedData
      GROUP BY YEAR(created_timestamp), MONTH(created_timestamp)
    `;
  
    db.query(query, [startOfYear, endOfYear, startOfYear, endOfYear], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        return;
      }
  
      res.json(result);
    });
});
  //ดึงข้อมูล ค่าเฉลี่ย ค่ารวม ของทั้งหมด ใช้แสดงเป็นตัวเลข ในปีปัจจุบัน
router.get('/sum_data_years', (req, res) => {
    const today = new Date(); // Get current date
    const startOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0); // Start of current year at 00:00:00
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59); // End of current year at 23:59:59
  
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
        SELECT voltage, current, power, energy, created_timestamp FROM Data_Tuya
        WHERE created_timestamp >= ? AND created_timestamp <= ?
      ) AS CombinedData
    `;
  
    db.query(query, [startOfYear, endOfYear, startOfYear, endOfYear], (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        return;
      }
  
      res.json(result[0]); // เนื่องจากมีแค่แถวเดียวจะเลือก index 0 เพื่อส่งผลลัพธ์กลับ
    });
});
module.exports = router;