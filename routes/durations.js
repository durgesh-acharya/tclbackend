const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');

// Import handleResponse
const handleResponse = require('../utils/handleResponse');

// Middleware to parse JSON
router.use(bodyParser.json());

// Get all durations
router.get('/all', (req, res) => {
  db.query('SELECT * FROM durations', (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Get a single duration by ID
router.get('/:id', (req, res) => {
  const durationId = req.params.id;
  db.query('SELECT * FROM durations WHERE durations_id = ?', [durationId], (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Create a new duration
router.post('/create', (req, res) => {
  const { durations_name } = req.body;

  const query = 'INSERT INTO durations (durations_name) VALUES (?)';
  db.query(query, [durations_name], (err, result) => {
    handleResponse(err, [{ durations_id: result.insertId }], res); // Use handleResponse here
  });
});

// Update a duration by ID
router.put('/edit/:id', (req, res) => {
  const durationId = req.params.id;
  const { durations_name } = req.body;

  const query = 'UPDATE durations SET durations_name = ? WHERE durations_id = ?';
  db.query(query, [durations_name, durationId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Duration not found', data: [] });
    }
    handleResponse(err, [{ message: 'Duration updated' }], res); // Use handleResponse here
  });
});

// Delete a duration by ID
router.delete('/delete/:id', (req, res) => {
  const durationId = req.params.id;

  db.query('DELETE FROM durations WHERE durations_id = ?', [durationId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Duration not found', data: [] });
    }
    handleResponse(err, [{ message: 'Duration deleted' }], res); // Use handleResponse here
  });
});

module.exports = router;
