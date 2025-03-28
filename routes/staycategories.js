const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');

// Import handleResponse
const handleResponse = require('../utils/handleResponse');

// Middleware to parse JSON
router.use(bodyParser.json());

// Get all staycategories
router.get('/all', (req, res) => {
  db.query('SELECT * FROM staycategories', (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Get a single staycategory by ID
router.get('/:id', (req, res) => {
  const staycategoryId = req.params.id;
  db.query('SELECT * FROM staycategories WHERE staycategories_id = ?', [staycategoryId], (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Create a new staycategory
router.post('/create', (req, res) => {
  const { staycategories_name } = req.body;

  const query = 'INSERT INTO staycategories (staycategories_name) VALUES (?)';
  db.query(query, [staycategories_name], (err, result) => {
    handleResponse(err, [{ staycategories_id: result.insertId }], res); // Use handleResponse here
  });
});

// Update a staycategory by ID
router.put('/edit/:id', (req, res) => {
  const staycategoryId = req.params.id;
  const { staycategories_name } = req.body;

  const query = 'UPDATE staycategories SET staycategories_name = ? WHERE staycategories_id = ?';
  db.query(query, [staycategories_name, staycategoryId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Staycategory not found', data: [] });
    }
    handleResponse(err, [{ message: 'Staycategory updated' }], res); // Use handleResponse here
  });
});

// Delete a staycategory by ID
router.delete('/delete/:id', (req, res) => {
  const staycategoryId = req.params.id;

  db.query('DELETE FROM staycategories WHERE staycategories_id = ?', [staycategoryId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Staycategory not found', data: [] });
    }
    handleResponse(err, [{ message: 'Staycategory deleted' }], res); // Use handleResponse here
  });
});

module.exports = router;
