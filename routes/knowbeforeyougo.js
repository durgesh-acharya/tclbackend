const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// Get all "Know Before You Go" entries
router.get('/all', (req, res) => {
  db.query('SELECT * FROM knowbeforeyougo', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single entry by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM knowbeforeyougo WHERE knowbeforeyougo_id = ?', [id], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new entry
router.post('/create', (req, res) => {
  const { knowbeforeyougo_point, knowbeforeyougo_packagesid } = req.body;

  const query = `
    INSERT INTO knowbeforeyougo 
    (knowbeforeyougo_point, knowbeforeyougo_packagesid) 
    VALUES (?, ?)
  `;
  db.query(query, [knowbeforeyougo_point, knowbeforeyougo_packagesid], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating entry', data: [] });
    }

    handleResponse(err, [{ knowbeforeyougo_id: result.insertId }], res);
  });
});

// Update an entry by ID
router.put('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { knowbeforeyougo_point, knowbeforeyougo_packagesid } = req.body;

  const query = `
    UPDATE knowbeforeyougo 
    SET knowbeforeyougo_point = ?, knowbeforeyougo_packagesid = ? 
    WHERE knowbeforeyougo_id = ?
  `;
  db.query(query, [knowbeforeyougo_point, knowbeforeyougo_packagesid, id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: '"Know Before You Go" entry not found', data: [] });
    }
    handleResponse(err, [{ message: 'Entry updated' }], res);
  });
});

// Delete an entry by ID
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM knowbeforeyougo WHERE knowbeforeyougo_id = ?', [id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: '"Know Before You Go" entry not found', data: [] });
    }
    handleResponse(err, [{ message: 'Entry deleted' }], res);
  });
});

// Get entries by package ID
router.get('/package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  db.query(
    'SELECT * FROM knowbeforeyougo WHERE knowbeforeyougo_packagesid = ?',
    [packageId],
    (err, results) => {
      handleResponse(err, results, res);
    }
  );
});

module.exports = router;
