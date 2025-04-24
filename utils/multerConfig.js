// utils/multerConfig.js
const multer = require('multer');
const path = require('path');

// Set the storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/images'); // Set the upload directory
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // Generate timestamp for unique filename
    const extname = path.extname(file.originalname); // Get file extension
    cb(null, `${timestamp}${extname}`); // Use timestamp and extension as filename
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'));
  }
};

// Multer upload instance with storage and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Max file size 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
