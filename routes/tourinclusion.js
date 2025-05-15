const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// Get all package inclusions
router.get('/all', (req, res) => {
  db.query('SELECT * FROM packageinclusion', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single package inclusion by ID
router.get('/:id', (req, res) => {
  const inclusionId = req.params.id;
  db.query('SELECT * FROM packageinclusion WHERE packageinclusion_id = ?', [inclusionId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new package inclusion
router.post('/create', (req, res) => {
  const { packageinclusion_inclusion, packageinclusion_packagesid } = req.body;

  const query = `
    INSERT INTO packageinclusion 
    (packageinclusion_inclusion, packageinclusion_packagesid) 
    VALUES (?, ?)
  `;
  db.query(query, [packageinclusion_inclusion, packageinclusion_packagesid], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating package inclusion', data: [] });
    }

    handleResponse(err, [{ packageinclusion_id: result.insertId }], res);
  });
});

// Update a package inclusion by ID
router.put('/edit/:id', (req, res) => {
  const inclusionId = req.params.id;
  const { packageinclusion_inclusion, packageinclusion_packagesid } = req.body;

  const query = `
    UPDATE packageinclusion 
    SET packageinclusion_inclusion = ?, packageinclusion_packagesid = ? 
    WHERE packageinclusion_id = ?
  `;
  db.query(query, [packageinclusion_inclusion, packageinclusion_packagesid, inclusionId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package inclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package inclusion updated' }], res);
  });
});

// Delete a package inclusion by ID
router.delete('/delete/:id', (req, res) => {
  const inclusionId = req.params.id;

  db.query('DELETE FROM packageinclusion WHERE packageinclusion_id = ?', [inclusionId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package inclusion not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package inclusion deleted' }], res);
  });
});

// Get package inclusions by package ID
router.get('/package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  db.query(
    'SELECT * FROM packageinclusion WHERE packageinclusion_packagesid = ?',
    [packageId],
    (err, results) => {
      handleResponse(err, results, res);
    }
  );
});

module.exports = router;
