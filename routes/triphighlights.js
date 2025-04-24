const express = require('express');
const db = require('../db'); // Assuming db.js handles your MySQL connection
const router = express.Router();
const bodyParser = require('body-parser');

// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse utility
const handleResponse = require('../utils/handleResponse');

// 1. Get all trip highlights
router.get('/all', (req, res) => {
  db.query('SELECT * FROM triphighlights', (err, results) => {
    handleResponse(err, results, res);
  });
});

// 2. Get a specific trip highlight by ID
router.get('/:id', (req, res) => {
  const triphighlightId = req.params.id;
  db.query('SELECT * FROM triphighlights WHERE triphighlights_id = ?', [triphighlightId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// 3. Create a new trip highlight
router.post('/create', (req, res) => {
  const { triphighlights_name, triphighlights_packageid } = req.body;

  const query = 'INSERT INTO triphighlights (triphighlights_name, triphighlights_packageid) VALUES (?, ?)';

  db.query(query, [triphighlights_name, triphighlights_packageid], (err, result) => {
    handleResponse(err, [{ triphighlights_id: result.insertId, triphighlights_name, triphighlights_packageid }], res);
  });
});

// 4. Update an existing trip highlight by ID
router.put('/edit/:id', (req, res) => {
  const triphighlightId = req.params.id;
  const { triphighlights_name, triphighlights_packageid } = req.body;

  const query = 'UPDATE triphighlights SET triphighlights_name = ?, triphighlights_packageid = ? WHERE triphighlights_id = ?';

  db.query(query, [triphighlights_name, triphighlights_packageid, triphighlightId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Trip highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Trip highlight updated successfully' }], res);
  });
});

// 5. Delete a trip highlight by ID
router.delete('/delete/:id', (req, res) => {
  const triphighlightId = req.params.id;

  db.query('DELETE FROM triphighlights WHERE triphighlights_id = ?', [triphighlightId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Trip highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Trip highlight deleted successfully' }], res);
  });
});

// 6. Get all trip highlights based on a package_id
router.get('/package/:package_id', (req, res) => {
  const packageId = req.params.package_id;

  const query = `
    SELECT triphighlights_id, triphighlights_name, triphighlights_packageid 
    FROM triphighlights
    WHERE triphighlights_packageid = ?
  `;

  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Export the router for use in your app
module.exports = router;
