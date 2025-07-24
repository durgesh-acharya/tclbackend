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
  p.packages_destinationroutesid AS destinationroutes_id,
  p.packages_staycategoriesid AS staycategories_id,
  p.packages_imgUrl AS imageurl,
  ld.locationdurations_tags AS duration_tags
FROM locations l
JOIN packages p ON l.locations_id = p.packages_locationsid
JOIN locationdurations ld ON p.packages_locationdurations = ld.locationdurations_id
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
        destinationroute_id : row.destinationroutes_id,
        staycategories_id : row.staycategories_id,
        actual_price: row.actual_price,
        offer_price: row.offer_price,
        rating: 4.5, // Hardcoded as per your structure
        duration_tags: row.duration_tags,
      });
    });

    // Use your custom response handler
    handleResponse(null, grouped, res);
  });
});

// GET: Packages for a specific location
router.get('/locationwithpackages/:id', (req, res) => {
  const locationId = req.params.id;

  const query = `
    SELECT 
      l.locations_id AS location_id,
      l.locations_name AS location_name,
      p.packages_id AS package_id,
      p.packages_name AS package_name,
      p.packages_actualprice AS actual_price,
      p.packages_offerprice AS offer_price,
      p.packages_locationdurations AS duration_id,
      p.packages_destinationroutesid AS destinationroutes_id,
      p.packages_staycategoriesid AS staycategories_id,
      p.packages_imgUrl AS imageurl,
      ld.locationdurations_tags AS duration_tags
    FROM locations l
    JOIN packages p ON l.locations_id = p.packages_locationsid
    JOIN locationdurations ld ON p.packages_locationdurations = ld.locationdurations_id
    WHERE l.locations_isactive = 1 
      AND p.packages_isactive = 1
      AND l.locations_id = ?
    ORDER BY p.packages_id;
  `;

  db.query(query, [locationId], (err, results) => {
    if (err || results.length === 0) {
      return handleResponse(err, results, res);
    }

    const location = {
      location_id: results[0].location_id,
      location_name: results[0].location_name,
      packages: results.map(row => ({
        package_id: row.package_id,
        package_name: row.package_name,
        imageurl: row.imageurl,
        duration_id: row.duration_id,
        destinationroute_id : row.destinationroutes_id,
        staycategories_id : row.staycategories_id,
        actual_price: row.actual_price,
        offer_price: row.offer_price,
        rating: 4.5, // Hardcoded
        duration_tags: row.duration_tags,
      })),
    };

    handleResponse(null, location, res);
  });
});

module.exports = router;
