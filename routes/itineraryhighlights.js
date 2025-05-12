const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');

// Import handleResponse utility
const handleResponse = require('../utils/handleResponse');

// Middleware to parse JSON
router.use(bodyParser.json());

/**
 * GET all itinerary highlights
 */
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM itineraryhighlights';
  db.query(query, (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET a single itinerary highlight by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM itineraryhighlights WHERE itineraryhighlights_id = ?';
  db.query(query, [id], (err, results) => {
    handleResponse(err, results, res);
  });
});

//  GET itinerary highlights by package ID

router.get('/package/:packageId', (req, res) => {
 const { packageId } = req.params;

 const query = 'SELECT * FROM itineraryhighlights WHERE itineraryhighlights_packagesid = ?';

 db.query(query, [packageId], (err, results) => {
   handleResponse(err, results, res);
 });
});

/**
 * POST create a new itinerary highlight
 */
router.post('/create', (req, res) => {
  const { itineraryhighlights_noofnifhts, itineraryhighlights_where, itineraryhighlights_packagesid } = req.body;
  const query = `INSERT INTO itineraryhighlights 
                 (itineraryhighlights_noofnifhts, itineraryhighlights_where, itineraryhighlights_packagesid) 
                 VALUES (?, ?, ?)`;

  db.query(query, [itineraryhighlights_noofnifhts, itineraryhighlights_where, itineraryhighlights_packagesid], (err, result) => {
    handleResponse(err, [{ itineraryhighlights_id: result.insertId }], res);
  });
});

/**
 * PUT update itinerary highlight by ID
 */
router.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { itineraryhighlights_noofnifhts, itineraryhighlights_where, itineraryhighlights_packagesid } = req.body;

  const query = `UPDATE itineraryhighlights 
                 SET itineraryhighlights_noofnifhts = ?, itineraryhighlights_where = ?, itineraryhighlights_packagesid = ?
                 WHERE itineraryhighlights_id = ?`;

  db.query(query, [itineraryhighlights_noofnifhts, itineraryhighlights_where, itineraryhighlights_packagesid, id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Itinerary Highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Itinerary Highlight updated' }], res);
  });
});

/**
 * DELETE itinerary highlight by ID
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM itineraryhighlights WHERE itineraryhighlights_id = ?';

  db.query(query, [id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Itinerary Highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Itinerary Highlight deleted' }], res);
  });
});

module.exports = router;
