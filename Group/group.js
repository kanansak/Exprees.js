const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the MySQL connection file

// Get all device groups
router.get('/device-groups', (req, res) => {
  const sql = 'SELECT * FROM Device_Group';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching device groups: ' + err.message);
      res.status(500).send('Error fetching device groups');
    } else {
      res.status(200).json(results);
    }
  });
});

// Update device group
router.put('/device-groups/:group_id', (req, res) => {
  const groupId = req.params.group_id;
  const { group_name } = req.body;

  const sql = 'UPDATE Device_Group SET group_name = ? WHERE group_id = ?';
  db.query(sql, [group_name, groupId], (err, result) => {
    if (err) {
      console.error('Error updating device group: ' + err.message);
      res.status(500).send('Error updating device group');
    } else {
      res.status(200).json({ message: 'Device group updated successfully' });
    }
  });
});

// Delete device group
router.delete('/device-groups/:group_id', (req, res) => {
  const groupId = req.params.group_id;

  const sql = 'DELETE FROM Device_Group WHERE group_id = ?';
  db.query(sql, [groupId], (err, result) => {
    if (err) {
      console.error('Error deleting device group: ' + err.message);
      res.status(500).send('Error deleting device group');
    } else {
      res.status(200).json({ message: 'Device group deleted successfully' });
    }
  });
});

// Insert device group
router.post('/device-groups', (req, res) => {
  const { group_id, group_name } = req.body;

  const sql = 'INSERT INTO Device_Group (group_id, group_name) VALUES (?, ?)';
  db.query(sql, [group_id, group_name], (err, result) => {
    if (err) {
      console.error('Error inserting device group: ' + err.message);
      res.status(500).send('Error inserting device group');
    } else {
      res.status(200).json({ message: 'Device group inserted successfully' });
    }
  });
});

module.exports = router;
