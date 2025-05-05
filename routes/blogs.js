const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../utils/multerConfig');
const handleResponse = require('../utils/handleResponse');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// Create blog post with image
router.post('/create', upload.single('image'), (req, res) => {

  const { blogs_title, blogs_content } = req.body;
  const blogs_imageurl = req.file ? `/assets/${req.file.filename}` : null;

  const query = `
  INSERT INTO blogs (blogs_title, blogs_content, blogs_imageurl, blogs_datetime) VALUES (?, ?, ?, NOW())
  `;

  db.query(query, [blogs_title, blogs_content, blogs_imageurl], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Error creating blogs', data: [] });
    }

    handleResponse(err, [{ blogs_id: result.insertId }], res);
  });
});



// Fetch all blogs
router.get('/',(req, res) => {

  db.query('SELECT * FROM blogs ORDER BY blogs_datetime DESC', (err, results) => {
    handleResponse(err, results, res);
  });
});

// Fetch blog by ID
router.get('/:id',(req, res) => {
  const blogid = req.params.id;
  db.query('SELECT * FROM blogs WHERE blogs_id = ?', [blogid ], (err, results) => {
    handleResponse(err, results, res);
  });
});


// Delete blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM blogs WHERE blogs_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'Blog not found' });
    }
    res.json({ status: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
