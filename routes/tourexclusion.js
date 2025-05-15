const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// Get all package exclusions
router.get('/all', (req, res) => {
  db.query('SELECT * FROM packageexclusion', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single package exclusion by ID
router.get('/:id', (req, res) => {
  const exclusionId = req.params.id;
  db.query('SELECT * FROM packageexclusion WHERE packageexclusion_id = ?', [exclusionId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new package exclusion
router.post('/create', (req, res) => {
  const { packageexclusion_exclusion, packageexclusion_packagesid } = req.body;

  const query = `
    INSERT INTO packageexclusion 
    (packageexclusion_exclusion, packageexclusion_packagesid) 
    VALUES (?, ?)
  `;
  db.query(query, [packageexclusion_exclusion, packageexclusion_packagesid], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating package exclusion', data: [] });
    }

    handleResponse(err, [{ packageexclusion_id: result.insertId }], res);
  });
});

// Update a package exclusion by ID
router.put('/edit/:id', (req, res) => {
  const exclusionId = req.params.id;
  const { packageexclusion_exclusion, packageexclusion_packagesid } = req.body;

  const query = `
    UPDATE packageexclusion 
    SET packageexclusion_exclusion = ?, packageexclusion_packagesid = ? 
    WHERE packageexclusion_id = ?
  `;
  db.query(query, [packageexclusion_exclusion, packageexclusion_packagesid, exclusionId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package exclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package exclusion updated' }], res);
  });
});

// Delete a package exclusion by ID
router.delete('/delete/:id', (req, res) => {
  const exclusionId = req.params.id;

  db.query('DELETE FROM packageexclusion WHERE packageexclusion_id = ?', [exclusionId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package exclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package exclusion deleted' }], res);
  });
});

// Get package exclusions by package ID
router.get('/package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  db.query(
    'SELECT * FROM packageexclusion WHERE packageexclusion_packagesid = ?',
    [packageId],
    (err, results) => {
      handleResponse(err, results, res);
    }
  );
});

module.exports = router;
