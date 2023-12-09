const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/latest_data', (req, res) => {
  const device_id = req.query.device_id;
  const queryESP = 'SELECT device_id, voltage, current, power, energy, frequency, pf, created_timestamp FROM Data_ESP WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';
  const queryTuya = 'SELECT device_id, voltage, current, power, energy,created_timestamp FROM Data_Tuya WHERE device_id = ? ORDER BY created_timestamp DESC LIMIT 1';

  const response = [];

  db.query(queryESP, [device_id], (errESP, resultESP) => {
    if (!errESP && resultESP.length > 0) {
      response.push(resultESP[0]);
    }

    db.query(queryTuya, [device_id], (errTuya, resultTuya) => {
      if (!errTuya && resultTuya.length > 0) {
        response.push(resultTuya[0]);
      }

      res.json(response);
    });
  });
});
//**หน้า devices**
//ข้อมูลรายวัน แสดงข้อมูลเป็นทุก 1 ชั่วโมง
// GET Data by device_id รายวัน แสดงข้อมูล ทุก 1ชั่วโมง
router.get('/energy', (req, res) => {
  const device_id = req.query.device_id; // Use req.query to get the device_id

  const today = new Date(); // Get current date
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of current day at 00:00

  const queryESP = `
    SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
    FROM Data_ESP
    WHERE device_id = ? AND created_timestamp >= ? AND DATE(created_timestamp) = CURDATE()
    GROUP BY device_id, DATE(created_timestamp), FLOOR(TIMESTAMPDIFF(SECOND, '1970-01-01', created_timestamp) / 3600)
  `;

  const queryTuya = `
    SELECT device_id, SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
    FROM Data_Tuya
    WHERE device_id = ? AND created_timestamp >= ? AND DATE(created_timestamp) = CURDATE()
    GROUP BY device_id, DATE(created_timestamp), FLOOR(TIMESTAMPDIFF(SECOND, '1970-01-01', created_timestamp) / 3600)
  `;

  const combinedData = [];

  db.query(queryESP, [device_id, startOfToday], (errESP, resultESP) => {
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

    db.query(queryTuya, [device_id, startOfToday], (errTuya, resultTuya) => {
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

//**หน้ากลุ่มอุปกรณ์**
//ข้อมูลรายวัน แสดงข้อมูลเป็นทุก 1 ชั่วโมง
//ดึงข้อมูลค่าเฉี่ย ค่ารวม โดยอ้างอิงตาม group_name ใช้แสดงเป็นตัวเลข แสดงข้อมูล 1 วัน ทุก 1ชั่วโมง
router.get('/data_by_group/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const today = new Date(); // Get current date
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of current day at 00:00:00
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0); // Start of next day at 00:00:00

  const query = `
    SELECT 
      Device_Group.group_id,
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
          COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp) < ?)
    GROUP BY Device_Group.group_id, 
             DATE_FORMAT(COALESCE(Data_ESP.created_timestamp, Data_Tuya.created_timestamp), '%Y-%m-%d %H')
  `;

  db.query(query, [groupId, startOfToday, endOfToday], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    res.json(result); // ส่งข้อมูลที่ได้กลับไป
  });
});
//ดึงข้อมูลทั้งหมด ตาม group_name ใช้แสดงในกราฟ แสดงข้อมูล 1 วัน ทุก 1ชั่วโมง
router.get('/all_data_group/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const today = new Date(); // Get current date
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of current day at 00:00:00
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0); // Start of next day at 00:00:00

  const query = `
    SELECT SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
    FROM (
      SELECT energy, created_timestamp
      FROM Data_ESP
      WHERE device_id IN (
        SELECT device_id FROM Device WHERE group_id = ?
      ) AND created_timestamp >= ? AND created_timestamp < ?
      
      UNION ALL
      
      SELECT energy, created_timestamp
      FROM Data_Tuya
      WHERE device_id IN (
        SELECT device_id FROM Device WHERE group_id = ?
      ) AND created_timestamp >= ? AND created_timestamp < ?
    ) AS combined_data
    GROUP BY FLOOR(TIMESTAMPDIFF(HOUR, '1970-01-01', created_timestamp))
  `;

  db.query(query, [groupId, startOfToday, endOfToday, groupId, startOfToday, endOfToday], (err, result) => {
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

//**หน้า all dashboard**
//ข้อมูลรายวัน แสดงข้อมูลเป็นทุก 1 ชั่วโมง
//ดึงข้อมูล ค่าเฉลี่ย ค่ารวม ของทั้งหมด ใช้แสดงเป็นตัวเลข
router.get('/sum_data', (req, res) => {
  const today = new Date(); // Get current date
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of current day at 00:00:00
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0); // Start of next day at 00:00:00

  const query = `
    SELECT 
      AVG(voltage) AS avg_voltage,
      AVG(current) AS avg_current,
      AVG(power) AS avg_power,
      SUM(energy) AS total_energy,
      MAX(created_timestamp) AS latest_timestamp
    FROM (
      SELECT voltage, current, power, energy, created_timestamp FROM Data_ESP
      UNION ALL
      SELECT voltage, current, power, energy, created_timestamp FROM Data_Tuya
    ) AS CombinedData
    WHERE created_timestamp >= ? AND created_timestamp < ?
  `;

  db.query(query, [startOfToday, endOfToday], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    res.json(result[0]); // เนื่องจากมีแค่แถวเดียวจะเลือก index 0 เพื่อส่งผลลัพธ์กลับ
  });
});
//ดึงข้อมูลทั้งหมด  ใช้แสดงในกราฟ 1 วัน ทุก 1ชั่วโมง
router.get('/all_data', (req, res) => {
  const today = new Date(); // Get current date
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of current day at 00:00:00
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0); // Start of next day at 00:00:00

  const query = `
    SELECT SUM(energy) as energy, MAX(created_timestamp) as created_timestamp
    FROM (
      SELECT 
        energy,
        created_timestamp
      FROM Data_ESP
      
      UNION ALL
      
      SELECT 
        energy,
        created_timestamp
      FROM Data_Tuya
    ) AS combined_data
    WHERE created_timestamp >= ? AND created_timestamp < ?
    GROUP BY FLOOR(TIMESTAMPDIFF(HOUR, '1970-01-01', created_timestamp))
  `;

  db.query(query, [startOfToday, endOfToday], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }
    
    res.json(result);
  });
});




//ดึงข้อมูลenergy ล่าสุด  ใช้แสดงตัวเลข
router.get('/latest_all_energy', (req, res) => {
  const query = `
    SELECT 
      'Latest All Energy' AS data_source,
      SUM(energy) AS latest_energy
    FROM (
      SELECT device_id, energy
      FROM (
        SELECT device_id, energy, created_timestamp
        FROM Data_ESP
        UNION ALL
        SELECT device_id, energy, created_timestamp
        FROM Data_Tuya
      ) AS combined_data
      WHERE (device_id, created_timestamp) IN (
        SELECT device_id, MAX(created_timestamp) AS latest_timestamp
        FROM (
          SELECT device_id, MAX(created_timestamp) AS created_timestamp
          FROM Data_ESP
          GROUP BY device_id
            
          UNION ALL
            
          SELECT device_id, MAX(created_timestamp) AS created_timestamp
          FROM Data_Tuya
          GROUP BY device_id
        ) AS max_timestamps
        GROUP BY device_id
      )
    ) AS latest_energy_data
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    res.json(result[0]); // ใช้ result[0] เพื่อเข้าถึงข้อมูลที่ได้จากการ SUM
  });
});
// ดึงข้อมูลล่าสุด energy ของอุปกรณ์แต่ละกลุ่ม และ ทำการ summ
router.get('/latest_energy_group/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const query = `
    SELECT 
      'Latest Energy' AS data_source,
      SUM(energy) AS latest_energy
    FROM (
      SELECT device_id, energy
      FROM (
        SELECT device_id, energy, created_timestamp
        FROM Data_ESP
        WHERE device_id IN (
          SELECT device_id
          FROM Device
          WHERE group_id = ?
        )
        UNION ALL
        SELECT device_id, energy, created_timestamp
        FROM Data_Tuya
        WHERE device_id IN (
          SELECT device_id
          FROM Device
          WHERE group_id = ?
        )
      ) AS combined_data
      WHERE (device_id, created_timestamp) IN (
        SELECT device_id, MAX(created_timestamp) AS latest_timestamp
        FROM (
          SELECT device_id, MAX(created_timestamp) AS created_timestamp
          FROM Data_ESP
          WHERE device_id IN (
            SELECT device_id
            FROM Device
            WHERE group_id = ?
          )
          GROUP BY device_id
            
          UNION ALL
            
          SELECT device_id, MAX(created_timestamp) AS created_timestamp
          FROM Data_Tuya
          WHERE device_id IN (
            SELECT device_id
            FROM Device
            WHERE group_id = ?
          )
          GROUP BY device_id
        ) AS max_timestamps
        GROUP BY device_id
      )
    ) AS latest_energy_data
  `;

  db.query(query, [groupId, groupId, groupId, groupId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }

    res.json(result[0]); // Use result[0] to access data for a single group
  });
});



module.exports = router;
//latest_data_esp?device_id=your_device_id
//latest_data_tuya?device_id=your_device_id
//http://localhost:3000/latest_data_esp?device_id=ESP-001
//http://localhost:3000/latest_data?device_id=ESP-002