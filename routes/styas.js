const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');

router.use(bodyParser.json());

/**
 * GET all stays
 */
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM stays';
  db.query(query, (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET stay by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM stays WHERE stays_id = ?';
  db.query(query, [id], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * GET stays by package ID
 */
router.get('/package/:packageId', (req, res) => {
  const { packageId } = req.params;
  const query = 'SELECT * FROM stays WHERE stays_packageid = ?';
  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * POST create a new stay
 */
router.post('/create', (req, res) => {
  const {
    stays_day,
    stays_stysat,
    stays_checkin,
    stays_checkout,
    stays_numofnight,
    stays_title,
    stays_isbreakfastinclude,
    stays_islunchinclude,
    stays_isdinnerinclude,
    stays_image1,
    stays_image2,
    stays_packageid
  } = req.body;

  const query = `INSERT INTO stays 
    (stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight, stays_title, 
     stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude, stays_image1, 
     stays_image2, stays_packageid)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight,
    stays_title, stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude,
    stays_image1, stays_image2, stays_packageid
  ];

  db.query(query, values, (err, result) => {
    handleResponse(err, [{ stays_id: result?.insertId }], res);
  });
});

/**
 * PUT update stay by ID
 */
router.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const {
    stays_day,
    stays_stysat,
    stays_checkin,
    stays_checkout,
    stays_numofnight,
    stays_title,
    stays_isbreakfastinclude,
    stays_islunchinclude,
    stays_isdinnerinclude,
    stays_image1,
    stays_image2,
    stays_packageid
  } = req.body;

  const query = `UPDATE stays SET 
    stays_day = ?, stays_stysat = ?, stays_checkin = ?, stays_checkout = ?, 
    stays_numofnight = ?, stays_title = ?, stays_isbreakfastinclude = ?, 
    stays_islunchinclude = ?, stays_isdinnerinclude = ?, stays_image1 = ?, 
    stays_image2 = ?, stays_packageid = ?
    WHERE stays_id = ?`;

  const values = [
    stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight,
    stays_title, stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude,
    stays_image1, stays_image2, stays_packageid, id
  ];

  db.query(query, values, (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Stay not found', data: [] });
    }
    handleResponse(err, [{ message: 'Stay updated' }], res);
  });
});

/**
 * DELETE stay by ID
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM stays WHERE stays_id = ?';

  db.query(query, [id], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Stay not found', data: [] });
    }
    handleResponse(err, [{ message: 'Stay deleted' }], res);
  });
});

module.exports = router;
