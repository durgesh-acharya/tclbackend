const express = require('express');
const db = require('../db');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse
const handleResponse = require('../utils/handleResponse');

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save images to the 'uploads' folder in the root directory of your project
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use the original file name or create a unique name
    cb(null, Date.now() + path.extname(file.originalname)); // appending timestamp to avoid name conflicts
  }
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, JPG, and PNG are allowed'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });




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
