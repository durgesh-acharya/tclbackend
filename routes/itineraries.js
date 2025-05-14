const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

/**
 * GET all itineraries
 */
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM itineraries';
  db.query(query, (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET itinerary by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM itineraries WHERE itineraries_id = ?';
  db.query(query, [id], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET itineraries by package ID
 */
router.get('/package/:packageId', (req, res) => {
  const { packageId } = req.params;
  const query = 'SELECT * FROM itineraries WHERE itineraries_paackagesid = ?';
  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * POST create a new itinerary
 */
router.post('/create', (req, res) => {
  const {
    itineraries_day,
    itineraries_title,
    itineraries_description,
    itineraries_packagesid
  } = req.body;

  const query = `INSERT INTO itineraries 
    (itineraries_day, itineraries_title, itineraries_description, itineraries_paackagesid)
    VALUES (?, ?, ?, ?)`;

  db.query(query, [itineraries_day, itineraries_title, itineraries_description, itineraries_packagesid], (err, result) => {
    handleResponse(err, [{ itineraries_id: result?.insertId }], res);
  });
});

/**
 * PUT update itinerary by ID
 */
router.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const {
    itineraries_day,
    itineraries_title,
    itineraries_description,
    itineraries_packagesid
  } = req.body;

  const query = `UPDATE itineraries SET 
    itineraries_day = ?, 
    itineraries_title = ?, 
    itineraries_description = ?, 
    itineraries_paackagesid = ?
    WHERE itineraries_id = ?`;

  db.query(query, [itineraries_day, itineraries_title, itineraries_description, itineraries_packagesid, id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Itinerary not found', data: [] });
    }
    handleResponse(err, [{ message: 'Itinerary updated' }], res);
  });
});

/**
 * DELETE itinerary by ID
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM itineraries WHERE itineraries_id = ?';

  db.query(query, [id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Itinerary not found', data: [] });
    }
    handleResponse(err, [{ message: 'Itinerary deleted' }], res);
  });
});

module.exports = router;
