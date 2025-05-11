const express = require('express');
const db = require('../db'); // Assuming db.js handles your MySQL connection
const router = express.Router();
const bodyParser = require('body-parser');

// Middleware to parse JSON
router.use(bodyParser.json());

// Import handleResponse utility
const handleResponse = require('../utils/handleResponse');

// Get all packages
router.get('/all', (req, res) => {
  db.query('SELECT * FROM packages', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Get a single package by ID
router.get('/:id', (req, res) => {
  const packageId = req.params.id;
  db.query('SELECT * FROM packages WHERE packages_id = ?', [packageId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Create a new package
router.post('/create', (req, res) => {
  const { 
    packages_name, 
    packages_actualprice, 
    packages_offerprice, 
    packages_locationsid, 
    packages_locationdurations, 
    packages_destinationroutesid, 
    packages_staycategoriesid,
    packages_isactive // New field for active status
  } = req.body;

  const query = `
    INSERT INTO packages (
      packages_name, 
      packages_actualprice, 
      packages_offerprice, 
      packages_locationsid, 
      packages_locationdurations, 
      packages_destinationroutesid, 
      packages_staycategoriesid,
      packages_isactive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    packages_name, 
    packages_actualprice, 
    packages_offerprice,  
    packages_locationsid, 
    packages_locationdurations, 
    packages_destinationroutesid, 
    packages_staycategoriesid,
    packages_isactive
  ], (err, result) => {
    handleResponse(err, [{ packages_id: result.insertId }], res);
  });
});

// Update a package by ID
router.put('/edit/:id', (req, res) => {
  const packageId = req.params.id;
  const { 
    packages_name, 
    packages_actualprice, 
    packages_offerprice, 
    packages_locationsid, 
    packages_locationdurations, 
    packages_destinationroutesid, 
    packages_staycategoriesid,
    packages_isactive // New field for active status
  } = req.body;

  const query = `
    UPDATE packages 
    SET 
      packages_name = ?, 
      packages_actualprice = ?, 
      packages_offerprice = ?, 
      packages_locationsid = ?, 
      packages_locationdurations = ?, 
      packages_destinationroutesid = ?, 
      packages_staycategoriesid = ?, 
      packages_isactive = ? 
    WHERE packages_id = ?
  `;

  db.query(query, [
    packages_name, 
    packages_actualprice, 
    packages_offerprice,  
    packages_locationsid, 
    packages_locationdurations, 
    packages_destinationroutesid, 
    packages_staycategoriesid,
    packages_isactive, 
    packageId
  ], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package updated successfully' }], res);
  });
});

// Delete a package by ID
router.delete('/delete/:id', (req, res) => {
  const packageId = req.params.id;

  db.query('DELETE FROM packages WHERE packages_id = ?', [packageId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Package not found', data: [] });
    }
    handleResponse(err, [{ message: 'Package deleted successfully' }], res);
  });
});

// Fetch packages by location_id
router.get('/location/:location_id', (req, res) => {
  const locationId = req.params.location_id;
  db.query('SELECT * FROM packages WHERE packages_locationsid = ?', [locationId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Fetch active packages by location_id
router.get('/location/active/:location_id', (req, res) => {
  const locationId = req.params.location_id;
  db.query('SELECT * FROM packages WHERE packages_locationsid = ? AND packages_isactive = 1', [locationId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Fetch inactive packages by location_id
router.get('/location/inactive/:location_id', (req, res) => {
  const locationId = req.params.location_id;
  db.query('SELECT * FROM packages WHERE packages_locationsid = ? AND packages_isactive = 0', [locationId], (err, results) => {
    handleResponse(err, results, res);
  });
});

// Toggle the active status of a package (Activate/Deactivate)
router.put('/toggle-status/:id', (req, res) => {
  const packageId = req.params.id;

  // First, get the current status of the package
  db.query('SELECT packages_isactive FROM packages WHERE packages_id = ?', [packageId], (err, results) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error fetching package status', data: [] });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: 'Package not found', data: [] });
    }

    const currentStatus = results[0].packages_isactive;
    const newStatus = currentStatus === 1 ? 0 : 1; // Toggle between active (1) and inactive (0)

    const query = 'UPDATE packages SET packages_isactive = ? WHERE packages_id = ?';
    db.query(query, [newStatus, packageId], (err, result) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Error updating package status', data: [] });
      }

      handleResponse(err, [{ message: `Package ${newStatus === 1 ? 'activated' : 'deactivated'} successfully` }], res);
    });
  });
});

// Export the router for use in your app
module.exports = router;
