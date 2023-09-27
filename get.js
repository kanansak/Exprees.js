const express = require('express');
const router = express.Router();

// เส้นทาง GET '/get-route'
router.get('/get-route', (req, res) => {
  res.send('นี่คือเส้นทาง GET ในไฟล์ get.js');
});
router.get("/read", async (req, res) => {
    try {
        connection.query("SELECT * FROM ESP_DATA", (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})
module.exports = router;
