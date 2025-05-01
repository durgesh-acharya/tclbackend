const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// Get all destination routes
router.get('/all', (req, res) => {
  db.query('SELECT * FROM destinationroutes', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single destination route by ID
router.get('/:id', (req, res) => {
  const destinationRouteId = req.params.id;
  db.query('SELECT * FROM destinationroutes WHERE destinationroutes_id = ?', [destinationRouteId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new destination route
router.post('/create', (req, res) => {
  const { destinationroutes_name, destinationroutes_locationdurationsid, destinationroutes_isactive } = req.body;

  const query = `
    INSERT INTO destinationroutes 
    (destinationroutes_name, destinationroutes_locationdurationsid, destinationroutes_isactive) 
    VALUES (?, ?, ?)
  `;
  db.query(query, [destinationroutes_name, destinationroutes_locationdurationsid, destinationroutes_isactive], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating destination route', data: [] });
    }

    handleResponse(err, [{ destinationroutes_id: result.insertId }], res);
  });
});

// Update a destination route by ID
router.put('/edit/:id', (req, res) => {
  const destinationRouteId = req.params.id;
  const { destinationroutes_name, destinationroutes_locationdurationsid, destinationroutes_isactive } = req.body;

  const query = `
    UPDATE destinationroutes 
    SET destinationroutes_name = ?, destinationroutes_locationdurationsid = ?, destinationroutes_isactive = ? 
    WHERE destinationroutes_id = ?
  `;
  db.query(query, [destinationroutes_name, destinationroutes_locationdurationsid, destinationroutes_isactive, destinationRouteId], (err, result) => {
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

// Get all destination routes joined with location destinations
router.get('/joined/all', (req, res) => {
  const query = `
    SELECT 
      destinationroutes.destinationroutes_id,
      destinationroutes.destinationroutes_name,
      destinationroutes.destinationroutes_locationdurationsid,
      destinationroutes.destinationroutes_isactive,
      locationdurations.locationdurations_name
    FROM destinationroutes
    JOIN locationdurations 
      ON destinationroutes.destinationroutes_locationdurationsid = locationdurations.locationdurations_id
  `;
  db.query(query, (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get destination routes by location destination ID
router.get('/joined/location/:locationdurationid', (req, res) => {
  const locationdurationid = req.params.locationdurationid;

  const query = `
    SELECT 
      destinationroutes.destinationroutes_id,
      destinationroutes.destinationroutes_name,
      destinationroutes.destinationroutes_locationdurationsid,
      destinationroutes.destinationroutes_isactive,
      locationdurations.locationdurations_name
    FROM destinationroutes
    JOIN locationdurations 
      ON destinationroutes.destinationroutes_locationdurationsid = locationdurations.locationdurations_id
    WHERE destinationroutes.destinationroutes_locationdurationsid = ?
  `;
  db.query(query, [locationdurationid], (err, results) => {
    handleResponse(err, results, res);
  });
});

module.exports = router;
