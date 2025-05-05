const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../utils/multerConfig');
const handleResponse = require('../utils/handleResponse');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// Create blog post with image
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { blogs_title, blogs_content } = req.body;
    const blogs_imageurl = req.file ? `/assets/${req.file.filename}` : null;

    const [result] = await db.execute(
      'INSERT INTO blogs (blogs_title, blogs_content, blogs_imageurl, blogs_datetime) VALUES (?, ?, ?, NOW())',
      [blogs_title, blogs_content, blogs_imageurl]
    );

    res.status(201).json({
      status: true,
      message: 'Blog created',
      data: { blog_id: result.insertId }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// Fetch all blogs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM blogs ORDER BY blogs_datetime DESC');
    handleResponse(null, rows, res);
  } catch (err) {
    handleResponse(err, [], res);
  }
});

// Fetch blog by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM blogs WHERE blogs_id = ?', [req.params.id]);
    handleResponse(null, rows, res);
  } catch (err) {
    handleResponse(err, [], res);
  }
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
