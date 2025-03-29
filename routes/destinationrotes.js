const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');

// Import handleResponse
const handleResponse = require('../utils/handleResponse');

// Middleware to parse JSON
router.use(bodyParser.json());

// Get all destination routes
router.get('/all', (req, res) => {
  db.query('SELECT * FROM destinationroutes', (err, results) => {
    handleResponse(err, results, res); // Use handleResponse to return response
  });
});

// Get a single destination route by ID
router.get('/:id', (req, res) => {
  const destinationRouteId = req.params.id;
  db.query('SELECT * FROM destinationroutes WHERE destinationroutes_id = ?', [destinationRouteId], (err, results) => {
    handleResponse(err, results, res); // Handle the response
  });
});

// Create a new destination route
router.post('/create', (req, res) => {
  const { destinationroutes_name, destinationroutes_locationsid, destinationroutes_isactive } = req.body;

  // Insert new destination route into database
  const query = 'INSERT INTO destinationroutes (destinationroutes_name, destinationroutes_locationsid, destinationroutes_isactive) VALUES (?, ?, ?)';
  db.query(query, [destinationroutes_name, destinationroutes_locationsid, destinationroutes_isactive], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating destination route', data: [] });
    }

    // Handle successful creation
    handleResponse(err, [{ destinationroutes_id: result.insertId }], res); 
  });
});

// Update a destination route by ID
router.put('/edit/:id', (req, res) => {
  const destinationRouteId = req.params.id;
  const { destinationroutes_name, destinationroutes_locationsid, destinationroutes_isactive } = req.body;

  const query = 'UPDATE destinationroutes SET destinationroutes_name = ?, destinationroutes_locationsid = ?, destinationroutes_isactive = ? WHERE destinationroutes_id = ?';
  db.query(query, [destinationroutes_name, destinationroutes_locationsid, destinationroutes_isactive, destinationRouteId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Destination route not found', data: [] });
    }
    handleResponse(err, [{ message: 'Destination route updated' }], res); 
  });
});

// Delete a destination route by ID
router.delete('/delete/:id', (req, res) => {
  const destinationRouteId = req.params.id;

  db.query('DELETE FROM destinationroutes WHERE destinationroutes_id = ?', [destinationRouteId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Destination route not found', data: [] });
    }
    handleResponse(err, [{ message: 'Destination route deleted' }], res); 
  });
});

module.exports = router;
