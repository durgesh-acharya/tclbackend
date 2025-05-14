const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

/**
 * GET all transfers
 */
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM transfers';
  db.query(query, (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET transfer by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM transfers WHERE transfers_id = ?';
  db.query(query, [id], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET transfers by package ID
 */
router.get('/package/:packageId', (req, res) => {
  const { packageId } = req.params;
  const query = 'SELECT * FROM transfers WHERE transfers_packagesid = ?';
  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * POST create a new transfer
 */
router.post('/create', (req, res) => {
  const {
    transfers_day,
    transfers_title,
    transfers_type,
    transfers_transferin,
    transfers_from,
    transfers_to,
    transfers_packagesid
  } = req.body;

  const query = `INSERT INTO transfers 
    (transfers_day, transfers_title, transfers_type, transfers_transferin, transfers_from, transfers_to, transfers_packagesid)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    transfers_day,
    transfers_title,
    transfers_type,
    transfers_transferin,
    transfers_from,
    transfers_to,
    transfers_packagesid
  ];

  db.query(query, values, (err, result) => {
    handleResponse(err, [{ transfers_id: result?.insertId }], res);
  });
});

/**
 * PUT update transfer by ID
 */
router.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const {
    transfers_day,
    transfers_title,
    transfers_type,
    transfers_transferin,
    transfers_from,
    transfers_to,
    transfers_packagesid
  } = req.body;

  const query = `UPDATE transfers SET 
    transfers_day = ?, transfers_title = ?, transfers_type = ?, transfers_transferin = ?, 
    transfers_from = ?, transfers_to = ?, transfers_packagesid = ?
    WHERE transfers_id = ?`;

  const values = [
    transfers_day,
    transfers_title,
    transfers_type,
    transfers_transferin,
    transfers_from,
    transfers_to,
    transfers_packagesid,
    id
  ];

  db.query(query, values, (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Transfer not found', data: [] });
    }
    handleResponse(err, [{ message: 'Transfer updated' }], res);
  });
});

/**
 * DELETE transfer by ID
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM transfers WHERE transfers_id = ?';

  db.query(query, [id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Transfer not found', data: [] });
    }
    handleResponse(err, [{ message: 'Transfer deleted' }], res);
  });
});

module.exports = router;
