const express = require('express');
const db = require('../db');
const router = express.Router();
const handleResponse = require('../utils/handleResponse');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// GET: Locations with their packages
router.get('/locations-with-packages', (req, res) => {
  const query = `
    SELECT 
      l.locations_id AS location_id,
      l.locations_name AS location_name,
      p.packages_id AS package_id,
      p.packages_name AS package_name,
      p.packages_actualprice AS actual_price,
      p.packages_offerprice AS offer_price,
      p.packages_locationdurations AS duration_id,
      p.packages_imageurl AS imageurl
    FROM locations l
    JOIN packages p ON l.locations_id = p.packages_locationsid
    WHERE l.locations_isactive = 1 AND p.packages_isactive = 1
    ORDER BY l.locations_id, p.packages_id;
  `;

  db.query(query, (err, results) => {
    if (err || results.length === 0) {
      return handleResponse(err, results, res);
    }

    // Group results by location
    const grouped = [];
    const map = new Map();

    results.forEach(row => {
      if (!map.has(row.location_id)) {
        map.set(row.location_id, {
          location_id: row.location_id,
          location_name: row.location_name,
          packages: [],
        });
        grouped.push(map.get(row.location_id));
      }

      map.get(row.location_id).packages.push({
        package_id: row.package_id,
        package_name: row.package_name,
        imageurl: row.imageurl,
        duration_id: row.duration_id,
        actual_price: row.actual_price,
        offer_price: row.offer_price,
        rating: 4.5, // Hardcoded as per your structure
      });
    });

    // Use your custom response handler
    handleResponse(null, grouped, res);
  });
});

module.exports = router;
