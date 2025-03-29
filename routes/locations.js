const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse
const handleResponse = require('../utils/handleResponse');
const upload = require('../utils/multerConfig');

// Get all locations
router.get('/all', (req, res) => {
  db.query('SELECT * FROM locations', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single location by ID
router.get('/:id', (req, res) => {
  const locationId = req.params.id;
  db.query('SELECT * FROM locations WHERE locations_id = ?', [locationId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new location with image upload
router.post('/create', upload.single('locations_imgurl'), (req, res) => {
  const { locations_name, locations_isactive } = req.body;
  const imageUrl = req.file ? '/uploads/' + req.file.filename : ''; // Save the file path (relative path)

  const query = 'INSERT INTO locations (locations_name, locations_imgurl, locations_isactive) VALUES (?, ?, ?)';
  db.query(query, [locations_name, imageUrl, locations_isactive], (err, result) => {
    handleResponse(err, [{ location_id: result.insertId }], res);
  });
});

// Update a location by ID
router.put('/edit/:id', (req, res) => {
  const locationId = req.params.id;
  const { locations_name, locations_imgurl, locations_isactive } = req.body;

  const query = 'UPDATE locations SET locations_name = ?, locations_imgurl = ?, locations_isactive = ? WHERE locations_id = ?';
  db.query(query, [locations_name, locations_imgurl, locations_isactive, locationId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Location not found', data: [] });
    }
    handleResponse(err, [{ message: 'Location updated' }], res);
  });
});

// Change Image for Location
router.put('/changeimage/:id', upload.single('image'), (req, res) => {
  const locationId = req.params.id;

  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({ status: false, message: 'No file uploaded', data: [] });
  }

  // Get the new image filename from req.file (it contains the name of the file after upload)
  const newImageUrl = `/uploads/${req.file.filename}`; // New image URL

  // Get the current image URL from the database
  db.query('SELECT locations_url FROM locations WHERE locations_id = ?', [locationId], (err, results) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error fetching current image', data: [] });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: 'Location not found', data: [] });
    }

    const oldImageUrl = results[0].locations_url;

    // If the old image exists, delete it from the server
    if (oldImageUrl) {
      const oldImagePath = path.join(__dirname, '..', oldImageUrl); // Construct the old image path on the server

      // Check if the file exists and delete it
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        } else {
          console.log('Old image deleted:', oldImagePath);
        }
      });
    }

    // Update the location record with the new image URL
    const query = 'UPDATE locations SET locations_url = ? WHERE locations_id = ?';
    db.query(query, [newImageUrl, locationId], (err, result) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Error updating image URL', data: [] });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: false, message: 'Location not found', data: [] });
      }

      // Respond with success
      handleResponse(null, [{ message: 'Image updated successfully', new_image_url: newImageUrl }], res);
    });
  });
});

// Delete a location by ID
router.delete('/delete/:id', (req, res) => {
  const locationId = req.params.id;

  db.query('DELETE FROM locations WHERE locations_id = ?', [locationId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Location not found', data: [] });
    }
    handleResponse(err, [{ message: 'Location deleted' }], res);
  });
});

module.exports = router;
