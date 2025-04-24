const express = require('express');
const db = require('../db'); // Assuming db.js handles your MySQL connection
const router = express.Router();
const bodyParser = require('body-parser');

// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse utility
const handleResponse = require('../utils/handleResponse');

// 1. Get all inclusions
router.get('/all', (req, res) => {
  db.query('SELECT * FROM `include`', (err, results) => {
    handleResponse(err, results, res);
  });
});

// 2. Get a specific inclusion by ID
router.get('/:id', (req, res) => {
  const includeId = req.params.id;
  db.query('SELECT * FROM `include` WHERE include_id = ?', [includeId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// 3. Create a new inclusion
router.post('/create', (req, res) => {
  const { package_id, includetagslist_id } = req.body;

  const query = 'INSERT INTO `include` (package_id, includetagslist_id) VALUES (?, ?)';

  db.query(query, [package_id, includetagslist_id], (err, result) => {
    handleResponse(err, [{ include_id: result.insertId, package_id, includetagslist_id }], res);
  });
});

// 4. Update an existing inclusion by ID
router.put('/edit/:id', (req, res) => {
  const includeId = req.params.id;
  const { package_id, includetagslist_id } = req.body;

  const query = 'UPDATE `include` SET package_id = ?, includetagslist_id = ? WHERE include_id = ?';

  db.query(query, [package_id, includetagslist_id, includeId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Inclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Inclusion updated successfully' }], res);
  });
});

// 5. Delete an inclusion by ID
router.delete('/delete/:id', (req, res) => {
  const includeId = req.params.id;

  db.query('DELETE FROM `include` WHERE include_id = ?', [includeId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Inclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Inclusion deleted successfully' }], res);
  });
});

// 6. Get all inclusions for a specific package_id and join with includetagslist
router.get('/package/:package_id', (req, res) => {
  const packageId = req.params.package_id;

  const query = `
    SELECT i.include_id, i.package_id, i.includetagslist_id, it.includetagslist_name
    FROM \`include\` i
    JOIN includetagslist it ON i.includetagslist_id = it.includetagslist_id
    WHERE i.package_id = ?
  `;

  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Export the router for use in your app
module.exports = router;
