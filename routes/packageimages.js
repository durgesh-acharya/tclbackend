const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');
const upload = require('../utils/multerConfig');
const handleResponse = require('../utils/handleResponse');

// Middleware to parse JSON
router.use(express.json());

/**
 * CREATE a new package image (with upload)
 */
router.post('/create', upload.single('image'), (req, res) => {
  const { packageimages_category, packageimages_packageid } = req.body;

  if (!req.file || !packageimages_category || !packageimages_packageid) {
    return res.status(400).json({ message: 'Missing required fields or image file.' });
  }

  const imageUrl = `/images/${req.file.filename}`;
  const query = `INSERT INTO packageimages (packageimages_url, packageimages_category, packageimages_packageid)
                 VALUES (?, ?, ?)`;

  db.query(query, [imageUrl, packageimages_category, packageimages_packageid], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({
      message: 'Package image uploaded successfully',
      packageimages_id: result.insertId,
      image_url: imageUrl
    });
  });
});

/**
 * GET all images for a specific package ID
 */
router.get('/by-package/:packageid', (req, res) => {
  const packageId = req.params.packageid;

  const query = `SELECT * FROM packageimages WHERE packageimages_packageid = ?`;
  db.query(query, [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

/**
 * UPDATE an image record (metadata or new image)
 */
router.put('/edit/:id', upload.single('image'), (req, res) => {
  const imageId = req.params.id;
  const { packageimages_category, packageimages_packageid } = req.body;

  let imageUrl = null;

  const updateImageUrl = () => {
    let updates = [];
    let params = [];

    if (imageUrl) {
      updates.push("packageimages_url = ?");
      params.push(imageUrl);
    }
    if (packageimages_category) {
      updates.push("packageimages_category = ?");
      params.push(packageimages_category);
    }
    if (packageimages_packageid) {
      updates.push("packageimages_packageid = ?");
      params.push(packageimages_packageid);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const query = `UPDATE packageimages SET ${updates.join(', ')} WHERE packageimages_id = ?`;
    params.push(imageId);

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Update failed', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Package image not found' });
      }

      res.json({ message: 'Package image updated successfully' });
    });
  };

  if (req.file) {
    // Delete old image
    db.query('SELECT packageimages_url FROM packageimages WHERE packageimages_id = ?', [imageId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching existing image', error: err });

      if (results.length === 0) {
        return res.status(404).json({ message: 'Image not found' });
      }

      const oldImagePath = path.join('/var/www', results[0].packageimages_url);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn('Old image deletion failed:', err);
      });

      imageUrl = `/images/${req.file.filename}`;
      updateImageUrl();
    });
  } else {
    updateImageUrl();
  }
});

/**
 * DELETE a package image by ID (and remove file)
 */
router.delete('/delete/:id', (req, res) => {
  const imageId = req.params.id;

  db.query('SELECT packageimages_url FROM packageimages WHERE packageimages_id = ?', [imageId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching image', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imagePath = path.join('/var/www', results[0].packageimages_url);

    // Delete the image file
    fs.unlink(imagePath, (err) => {
      if (err) console.warn('Failed to delete image file:', err);
    });

    // Delete DB record
    db.query('DELETE FROM packageimages WHERE packageimages_id = ?', [imageId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error deleting record', error: err });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Image not found' });
      }

      res.json({ message: 'Package image deleted successfully' });
    });
  });
});

module.exports = router;
