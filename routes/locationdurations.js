const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
// Import handleResponse
const handleResponse = require('../utils/handleResponse');
const upload = require('../utils/multerConfig');
// Middleware to parse JSON
router.use(bodyParser.json());


  

// Get all location durations
router.get('/all', (req, res) => {
  db.query('SELECT * FROM locationdurations', (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Get a single location duration by ID
router.get('/:id', (req, res) => {
  const locationDurationsId = req.params.id;
  db.query('SELECT * FROM locationdurations WHERE locationdurations_id = ?', [locationDurationsId], (err, results) => {
    handleResponse(err, results, res); // Use handleResponse here
  });
});

// Create a new location duration
router.post('/create', upload.single('image'), (req, res) => {
  const {
    locationdurations_locationsid,
    locationdurations_durations_id,
    locationdurations_tags,
    locationdurations_startsfrom,
    locationdurations_isactive
  } = req.body;

  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({ status: false, message: 'No file uploaded', data: [] });
  }

  const imageUrl = `/assets/${req.file.filename}`;

  const query = `
    INSERT INTO locationdurations 
    (locationdurations_locationsid, locationdurations_durations_id, locationdurations_tags, locationdurations_startsfrom, locationdurations_imageurl, locationdurations_isactive) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    locationdurations_locationsid,
    locationdurations_durations_id,
    locationdurations_tags,
    locationdurations_startsfrom,
    imageUrl,
    locationdurations_isactive
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: 'Database error', data: [] });
    }

    return res.status(200).json({
      status: true,
      message: 'Location duration created successfully',
      data: {
        locationdurations_id: result.insertId,
        image_url: imageUrl
      }
    });
  });
});

// Update a location duration by ID
router.put('/edit/:id', (req, res) => {
  const locationDurationsId = req.params.id;
  const { locationdurations_locationsid, locationdurations_durations_id, locationdurations_imageurl, locationdurations_isactive } = req.body;

  const query = 'UPDATE locationdurations SET locationdurations_locationsid = ?, locationdurations_durations_id = ?, locationdurations_imageurl = ?, locationdurations_isactive = ? WHERE locationdurations_id = ?';
  db.query(query, [locationdurations_locationsid, locationdurations_durations_id, locationdurations_imageurl, locationdurations_isactive, locationDurationsId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Location duration not found', data: [] });
    }
    handleResponse(err, [{ message: 'Location duration updated' }], res); // Use handleResponse here
  });
});

// Change Image for LocationDuration
router.put('/changeimage/:id', upload.single('image'), (req, res) => {
    const locationDurationsId = req.params.id;
  
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'No file uploaded', data: [] });
    }
  
    // Get the image filename from req.file (it contains the name of the file after upload)
    const newImageUrl = `/uploads/${req.file.filename}`; // New image URL
  
    // Get the current image URL from the database
    db.query('SELECT locationdurations_imageurl FROM locationdurations WHERE locationdurations_id = ?', [locationDurationsId], (err, results) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Error fetching current image', data: [] });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ status: false, message: 'Location duration not found', data: [] });
      }
  
      const oldImageUrl = results[0].locationdurations_imageurl;
  
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
  
      // Update the location duration record with the new image URL
      const query = 'UPDATE locationdurations SET locationdurations_imageurl = ? WHERE locationdurations_id = ?';
      db.query(query, [newImageUrl, locationDurationsId], (err, result) => {
        if (err) {
          return res.status(500).json({ status: false, message: 'Error updating image URL', data: [] });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ status: false, message: 'Location duration not found', data: [] });
        }
  
        // Respond with success
        handleResponse(null, [{ message: 'Image updated successfully', new_image_url: newImageUrl }], res);
      });
    });
  });

// Delete a location duration by ID
router.delete('/delete/:id', (req, res) => {
  const locationDurationsId = req.params.id;

  db.query('DELETE FROM locationdurations WHERE locationdurations_id = ?', [locationDurationsId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Location duration not found', data: [] });
    }
    handleResponse(err, [{ message: 'Location duration deleted' }], res); // Use handleResponse here
  });
});

//get joined data

router.get('/all/joined', (req, res) => {
  const query = `
    SELECT 
      locationdurations.locationdurations_id,
      locationdurations.locationdurations_tags,
      locationdurations.locationdurations_startsfrom,
      locationdurations.locationdurations_imageurl,
      locationdurations.locationdurations_isactive,

      locations.locations_id,
      locations.locations_name,
      locations.locations_url,
      locations.locations_isactive AS locations_isactive,

      durations.durations_id,
      durations.durations_name

    FROM locationdurations
    JOIN locations 
      ON locationdurations.locationdurations_locationsid = locations.locations_id
    JOIN durations 
      ON locationdurations.locationdurations_durations_id = durations.durations_id
  `;

  db.query(query, (err, results) => {
    
    if (err) {
      console.error('Query Error:', err);
      return res.status(500).json({ status: false, message: 'Database error', data: [] });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ status: false, message: 'No data available', data: [] });
    }

    res.json({ status: true, message: 'Success', data: results });
  });
});





module.exports = router;
