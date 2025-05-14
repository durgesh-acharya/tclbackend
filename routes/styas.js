const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const handleResponse = require('../utils/handleResponse');
const upload = require('../utils/multerConfig');

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
 * POST create a new stay (with image upload)
 */
router.post(
  '/create',
  upload.fields([
    { name: 'stays_image1', maxCount: 1 },
    { name: 'stays_image2', maxCount: 1 }
  ]),
  (req, res) => {
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
      stays_packageid
    } = req.body;

    const file1 = req.files['stays_image1']?.[0];
    const file2 = req.files['stays_image2']?.[0];

    const image1Path = file1 ? `/assets/${file1.filename}` : null;
    const image2Path = file2 ? `/assets/${file2.filename}` : null;

    const query = `INSERT INTO stays 
      (stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight, stays_title, 
      stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude, 
      stays_image1, stays_image2, stays_packageid) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight,
      stays_title, stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude,
      image1Path, image2Path, stays_packageid
    ];

    db.query(query, values, (err, result) => {
      handleResponse(err, [{ stays_id: result?.insertId }], res);
    });
  }
);

/**
 * PUT update stay by ID (with optional image upload)
 */
router.put(
  '/edit/:id',
  upload.fields([
    { name: 'stays_image1', maxCount: 1 },
    { name: 'stays_image2', maxCount: 1 }
  ]),
  (req, res) => {
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
      stays_packageid
    } = req.body;

    const file1 = req.files['stays_image1']?.[0];
    const file2 = req.files['stays_image2']?.[0];

    const image1Path = file1 ? `/assets/${file1.filename}` : null;
    const image2Path = file2 ? `/assets/${file2.filename}` : null;

    // Optional image update logic
    let query = `UPDATE stays SET 
      stays_day = ?, stays_stysat = ?, stays_checkin = ?, stays_checkout = ?, 
      stays_numofnight = ?, stays_title = ?, stays_isbreakfastinclude = ?, 
      stays_islunchinclude = ?, stays_isdinnerinclude = ?, 
      stays_packageid = ?`;

    const values = [
      stays_day, stays_stysat, stays_checkin, stays_checkout, stays_numofnight,
      stays_title, stays_isbreakfastinclude, stays_islunchinclude, stays_isdinnerinclude,
      stays_packageid
    ];

    if (image1Path) {
      query += `, stays_image1 = ?`;
      values.push(image1Path);
    }

    if (image2Path) {
      query += `, stays_image2 = ?`;
      values.push(image2Path);
    }

    query += ` WHERE stays_id = ?`;
    values.push(id);

    db.query(query, values, (err, result) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: false, message: 'Stay not found', data: [] });
      }
      handleResponse(err, [{ message: 'Stay updated' }], res);
    });
  }
);

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
