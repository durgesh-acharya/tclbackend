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

  // Check if necessary fields are present
  if (!locations_name || !locations_isactive) {
    return res.status(400).json({ message: 'Missing required fields: locations_name or locations_isactive' });
  }

  // Check if file was uploaded
  const imageUrl = req.file ? '/assets/' + req.file.filename : null;

  // Handle case when no file was uploaded
  if (!imageUrl) {
    return res.status(400).json({ message: 'No image uploaded.' });
  }

  // SQL query to insert location data into the database
  const query = 'INSERT INTO locations (locations_name, locations_url, locations_isactive) VALUES (?, ?, ?)';

  db.query(query, [locations_name, imageUrl, locations_isactive], (err, result) => {
    if (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ message: 'Database error occurred', error: err });
    }

    // Return the result with the location ID
    return res.status(201).json({
      message: 'Location created successfully',
      location_id: result.insertId,
      image_url: imageUrl
    });
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

  if (!req.file) {
    return res.status(400).json({ status: false, message: 'No file uploaded', data: [] });
  }

  const newImageUrl = `/images/${req.file.filename}`; // New image URL

  db.query('SELECT locations_url FROM locations WHERE locations_id = ?', [locationId], (err, results) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error fetching current image', data: [] });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: 'Location not found', data: [] });
    }

    const oldImageUrl = results[0].locations_url;

    //  Safely delete old image if it exists
    if (oldImageUrl) {
      const oldImagePath = path.join('/var/www', oldImageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        } else {
          console.log('Old image deleted:', oldImagePath);
        }
      });
    }

    // Update DB with new image URL
    const query = 'UPDATE locations SET locations_url = ? WHERE locations_id = ?';
    db.query(query, [newImageUrl, locationId], (err, result) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Error updating image URL', data: [] });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: false, message: 'Location not found', data: [] });
      }

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
