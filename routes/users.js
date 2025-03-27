const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

 // Import the middleware
 const { authenticateToken } = require('../middleware/authMiddleware'); 

const bodyParser = require('body-parser');

router.use(bodyParser.json());
// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  // Check if the email already exists
  db.execute('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in the database
    db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  // Find the user in the database
  db.execute('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: result[0].id, email: result[0].email }, 'your_jwt_secret', { expiresIn: '1h' });

      return res.status(200).json({ message: 'Login successful', token });
    });
  });
});

// Profile Route (Protected)
router.get('/profile/:email', authenticateToken, (req, res) => {
  const { email } = req.params;

  // Fetch user from the database by email
  db.execute('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user profile (excluding password for security)
    const { password, ...userProfile } = result[0];
    return res.status(200).json(userProfile);
  });
});



module.exports = router;
  