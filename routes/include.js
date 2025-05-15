const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// 1. Get all include records
router.get('/all', (req, res) => {
  db.query('SELECT * FROM `include`', (err, results) => {
    handleResponse(err, results, res);
  });
});

// 2. Get a single include record by ID
router.get('/:id', (req, res) => {
  const includeId = req.params.id;
  db.query('SELECT * FROM `include` WHERE include_id = ?', [includeId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// 3. Create a new include entry
router.post('/create', (req, res) => {
  const { include_includtagname, include_packageid } = req.body;

  const query = `
    INSERT INTO \`include\` (include_includtagname, include_packageid)
    VALUES (?, ?)
  `;

  db.query(query, [include_includtagname, include_packageid], (err, result) => {
    handleResponse(err, [
      {
        include_id: result.insertId,
        include_includtagname,
        include_packageid,
      },
    ], res);
  });
});

// 4. Update an include record by ID
router.put('/edit/:id', (req, res) => {
  const includeId = req.params.id;
  const { include_includtagname, include_packageid } = req.body;

  const query = `
    UPDATE \`include\`
    SET include_includtagname = ?, include_packageid = ?
    WHERE include_id = ?
  `;

  db.query(query, [include_includtagname, include_packageid, includeId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Inclusion not found', data: [] });
    }

    handleResponse(err, [{ message: 'Inclusion updated successfully' }], res);
  });
});

// 5. Delete an include record by ID
router.delete('/delete/:id', (req, res) => {
  const includeId = req.params.id;

  db.query('DELETE FROM `include` WHERE include_id = ?', [includeId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Inclusion not found', data: [] });
    }

    handleResponse(err, [{ message: 'Inclusion deleted successfully' }], res);
  });
});

// ✅ 6. Get all include records for a specific package ID
router.get('/package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  const query = `
    SELECT * FROM \`include\`
    WHERE include_packageid = ?
  `;

  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

module.exports = router;
