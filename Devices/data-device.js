const express = require("express");
const db = require("../db");
const router = express.Router();
const path = require("path");

// CREATE (POST)
router.post("/devices", (req, res) => {
  const {
    device_id,
    device_name,
    device_detail,
    device_location,
    device_map_img,
    device_type,
    group_id,
  } = req.body;
  const query =
    "INSERT INTO device (device_id, device_name, device_detail, device_location, device_map_img, device_type, group_id, created_timestamp, modified_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

  // แทนค่า null ถ้าข้อมูลเป็น null
  const values = [
    device_id || null,
    device_name || null,
    device_detail || null,
    device_location || null,
    device_map_img || null,
    device_type || null,
    group_id || null,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการสร้างข้อมูล: " + err.message);
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" });
    }

    return res.json({ message: "ข้อมูลถูกสร้างเรียบร้อย" });
  });
});

// READ (GET all devices)
router.get('/devices', (req, res) => {
  const query = `
    SELECT 
      device.device_id, 
      device.device_name, 
      device.device_detail, 
      device.device_location, 
      device.device_map_img,
      device.group_id, 
      device.created_timestamp, 
      device.modified_timestamp,
      device_group.group_name,
      IFNULL(esp.latest_created_timestamp, tuya.latest_created_timestamp) AS latest_created_timestamp
    FROM device
    INNER JOIN device_group ON device.group_id = device_group.group_id
    LEFT JOIN (
      SELECT device_id, MAX(created_timestamp) AS latest_created_timestamp
      FROM data_esp
      GROUP BY device_id
    ) AS esp ON device.device_id = esp.device_id
    LEFT JOIN (
      SELECT device_id, MAX(created_timestamp) AS latest_created_timestamp
      FROM data_tuya
      GROUP BY device_id
    ) AS tuya ON device.device_id = tuya.device_id;
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
      return;
    }

    res.json(result);
  });
});


// READ (GET device by ID)
router.get("/devices/:device_id", (req, res) => {
  const deviceId = req.params.device_id;
  const query = "SELECT * FROM device WHERE device_id = ?";

  db.query(query, [deviceId], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message);
      res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ message: "ไม่พบข้อมูลอุปกรณ์ที่ระบุ" });
      return;
    }

    res.json(result[0]);
  });
});

// router.put('/devices/:device_id', (req, res) => {
//   const device_id = req.params.device_id;
//   const { device_name, device_detail, device_location, device_map, device_type, group_id } = req.body;
//   const query = 'UPDATE device SET device_name = ?, device_detail = ?, device_location = ?, device_map_img = ?, device_type = ?, group_id = ?, modified_timestamp = NOW() WHERE device_id = ?';

//   if (!device_name || !device_location) {
//     res.status(400).json({ message: 'กรุณากรอกข้อมูลทั้งหมด' });
//     return;
//   }

//   // // เช็คว่า device_type ถูกส่งมาหรือไม่
//   // if (typeof device_type !== 'undefined') {
//   //   // แปลง device_type เป็นตัวเลข
//   //   const deviceTypeInt = parseInt(device_type, 10);

//   //   if (isNaN(deviceTypeInt)) {
//   //     res.status(400).json({ message: 'device_type ต้องเป็นค่าจำนวนเต็ม' });
//   //     return;
//   //   }
//   // }

//   db.query(query, [device_name, device_detail, device_location, device_map, device_type, group_id, device_id], (err, result) => {
//     if (err) {
//       console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err.message);
//       res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
//       return;
//     }

//     if (result.affectedRows === 0) {
//       res.status(404).json({ message: 'ไม่พบข้อมูลอุปกรณ์ที่ระบุ' });
//       return;
//     }

//     res.json({ message: 'ข้อมูลถูกอัปเดตเรียบร้อย' });
//   });
// });

// UPDATE (PUT)

router.put("/devices/:device_id", (req, res) => {
  const device_id = req.params.device_id;
  const {
    device_name,
    device_detail,
    device_location,
    device_map_img,
    device_type,
    group_id,
  } = req.body;
  const query =
    "UPDATE device SET device_name = ?, device_detail = ?, device_location = ?, device_map_img = ?, device_type = ?, group_id = ?, modified_timestamp = NOW() WHERE device_id = ?";

  if (!device_name || !device_location) {
    res.status(400).json({ message: "กรุณากรอกข้อมูลทั้งหมด" });
    return;
  }

  db.query(
    query,
    [
      device_name,
      device_detail,
      device_location,
      device_map_img,
      device_type,
      group_id,
      device_id,
    ],
    (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " + err.message);
        res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "ไม่พบข้อมูลอุปกรณ์ที่ระบุ" });
        return;
      }

      res.json({ message: "ข้อมูลถูกอัปเดตเรียบร้อย" });
    }
  );
});

// DELETE (DELETE)
router.delete("/devices/:device_id", (req, res) => {
  const device_id = req.params.device_id;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการเริ่มทำงานของธุรกรรม: " + err.message);
      res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
      return;
    }

    // Define SQL queries
    const updateDataESPQuery = "DELETE FROM data_esp WHERE device_id = ?";
    const updateDataTuyaQuery = "DELETE FROM data_tuya WHERE device_id = ?";
    const deleteDeviceQuery = "DELETE FROM device WHERE device_id = ?";

    // Execute queries
    db.query(updateDataESPQuery, [device_id], (err, result) => {
      if (err) {
        db.rollback(() => {
          console.error(
            "เกิดข้อผิดพลาดในการอัปเดตข้อมูล data_esp: " + err.message
          );
          res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
        });
        return;
      }

      db.query(updateDataTuyaQuery, [device_id], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error(
              "เกิดข้อผิดพลาดในการอัปเดตข้อมูล data_tuya: " + err.message
            );
            res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
          });
          return;
        }

        db.query(deleteDeviceQuery, [device_id], (err, result) => {
          if (err) {
            db.rollback(() => {
              console.error(
                "เกิดข้อผิดพลาดในการลบข้อมูล device: " + err.message
              );
              res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
            });
            return;
          }

          // Commit the transaction if all queries are successful
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error(
                  "เกิดข้อผิดพลาดในการยืนยันการทำงานของธุรกรรม: " + err.message
                );
                res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
              });
              return;
            }

            res.json({ message: "ข้อมูลถูกลบเรียบร้อย" });
          });
        });
      });
    });
  });
});

module.exports = router;
