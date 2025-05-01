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
    const { locationdurations_locationsid, locationdurations_durations_id, locationdurations_isactive } = req.body;
  
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'No file uploaded', data: [] });
    }
  
    // Get the image filename from req.file (it contains the name of the file after upload)
    const imageUrl = `/uploads/${req.file.filename}`; // Construct the image URL
  
    // Insert the new location duration with the image URL
    const query = 'INSERT INTO locationdurations (locationdurations_locationsid, locationdurations_durations_id, locationdurations_imageurl, locationdurations_isactive) VALUES (?, ?, ?, ?)';
    db.query(query, [locationdurations_locationsid, locationdurations_durations_id, imageUrl, locationdurations_isactive], (err, result) => {
      handleResponse(err, [{ locationdurations_id: result.insertId, image_url: imageUrl }], res); // Respond with inserted ID and image URL
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

//data joined with locations and durations
router.get('/joined-details', (req, res) => {
  const query = `
    SELECT 
      ld.*,
      l.* AS location_data,
      d.* AS duration_data
    FROM 
      locationdurations ld
    JOIN 
      locations l ON ld.locationdurations_locationsid = l.locations_id
    JOIN 
      durations d ON ld.locationdurations_durations_id = d.durations_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Database error', data: [] });
    }

    // Nest location and duration data
    const mappedResults = results.map(row => {
      const {
        locationdurations_id,
        locationdurations_locationsid,
        locationdurations_durations_id,
        locationdurations_tags,
        locationdurations_startsfrom,
        locationdurations_imageurl,
        locationdurations_isactive,
        ...rest
      } = row;

      // Extract location and duration data
      const location = {};
      const duration = {};

      for (const key in rest) {
        if (key.startsWith('location_data.')) {
          location[key.replace('location_data.', '')] = rest[key];
        } else if (key.startsWith('duration_data.')) {
          duration[key.replace('duration_data.', '')] = rest[key];
        }
      }

      return {
        locationdurations_id,
        locationdurations_locationsid,
        locationdurations_durations_id,
        locationdurations_tags,
        locationdurations_startsfrom,
        locationdurations_imageurl,
        locationdurations_isactive,
        location,
        duration
      };
    });

    res.json({
      status: true,
      message: 'Joined data fetched successfully',
      data: mappedResults
    });
  });
});


module.exports = router;
