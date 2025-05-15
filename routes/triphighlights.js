const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

// Get all trip highlights
router.get('/all', (req, res) => {
  db.query('SELECT * FROM triphighlights', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single trip highlight by ID
router.get('/:id', (req, res) => {
  const tripHighlightId = req.params.id;
  db.query('SELECT * FROM triphighlights WHERE triphighlights_id = ?', [tripHighlightId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new trip highlight
router.post('/create', (req, res) => {
  const { triphighlights_name, triphighlights_packageid } = req.body;

  const query = `
    INSERT INTO triphighlights 
    (triphighlights_name, triphighlights_packageid) 
    VALUES (?, ?)
  `;
  db.query(query, [triphighlights_name, triphighlights_packageid], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating trip highlight', data: [] });
    }

    handleResponse(err, [{ triphighlights_id: result.insertId }], res);
  });
});

// Update a trip highlight by ID
router.put('/edit/:id', (req, res) => {
  const tripHighlightId = req.params.id;
  const { triphighlights_name, triphighlights_packageid } = req.body;

  const query = `
    UPDATE triphighlights 
    SET triphighlights_name = ?, triphighlights_packageid = ? 
    WHERE triphighlights_id = ?
  `;
  db.query(query, [triphighlights_name, triphighlights_packageid, tripHighlightId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Trip highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Trip highlight updated' }], res);
  });
});

// Delete a trip highlight by ID
router.delete('/delete/:id', (req, res) => {
  const tripHighlightId = req.params.id;

  db.query('DELETE FROM triphighlights WHERE triphighlights_id = ?', [tripHighlightId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Trip highlight not found', data: [] });
    }
    handleResponse(err, [{ message: 'Trip highlight deleted' }], res);
  });
});

// Get trip highlights by package ID
router.get('/package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  db.query(
    'SELECT * FROM triphighlights WHERE triphighlights_packageid = ?',
    [packageId],
    (err, results) => {
      handleResponse(err, results, res);
    }
  );
});

module.exports = router;
