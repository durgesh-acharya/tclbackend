const express = require('express');
const db = require('../db'); // Assuming db.js handles your MySQL connection
const router = express.Router();
const bodyParser = require('body-parser');

// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse utility
const handleResponse = require('../utils/handleResponse');

// 1. Get all tags
router.get('/all', (req, res) => {
  db.query('SELECT * FROM includetagslist', (err, results) => {
    handleResponse(err, results, res);
  });
});

// 2. Get a single tag by ID
router.get('/:id', (req, res) => {
  const tagId = req.params.id;
  db.query('SELECT * FROM includetagslist WHERE includetagslist_id = ?', [tagId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// 3. Create a new tag
router.post('/create', (req, res) => {
  const { includetagslist_name } = req.body;

  const query = 'INSERT INTO includetagslist (includetagslist_name) VALUES (?)';

  db.query(query, [includetagslist_name], (err, result) => {
    handleResponse(err, [{ includetagslist_id: result.insertId, includetagslist_name }], res);
  });
});

// 4. Update an existing tag by ID
router.put('/edit/:id', (req, res) => {
  const tagId = req.params.id;
  const { includetagslist_name } = req.body;

  const query = 'UPDATE includetagslist SET includetagslist_name = ? WHERE includetagslist_id = ?';

  db.query(query, [includetagslist_name, tagId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Tag not found', data: [] });
    }
    handleResponse(err, [{ message: 'Tag updated successfully' }], res);
  });
});

// 5. Delete a tag by ID
router.delete('/delete/:id', (req, res) => {
  const tagId = req.params.id;

  db.query('DELETE FROM includetagslist WHERE includetagslist_id = ?', [tagId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Tag not found', data: [] });
    }
    handleResponse(err, [{ message: 'Tag deleted successfully' }], res);
  });
});

// Export the router for use in your app
module.exports = router;
