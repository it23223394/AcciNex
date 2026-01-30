const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const file = req.file;
    
    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      // Delete file if invalid
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Invalid file type. Only JPEG and PNG allowed.' });
    }

    // Generate unique filename
    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Move file to uploads directory
    fs.renameSync(file.path, filepath);

    // Extract EXIF data from image
    let gpsData = null;
    try {
      const response = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5000'}/extract-exif`, {
        image_path: filepath,
        filename: filename
      });
      
      if (response.data && response.data.gps_data) {
        gpsData = response.data.gps_data;
      }
    } catch (aiErr) {
      console.warn('EXIF extraction failed:', aiErr.message);
      // Continue without EXIF data
    }

    // Return image info and extracted GPS data
    res.status(201).json({
      success: true,
      image_url: `/uploads/${filename}`,
      image_path: filepath,
      filename: filename,
      size: file.size,
      mimetype: file.mimetype,
      gps_data: gpsData,
      message: 'Image uploaded and processed successfully'
    });

  } catch (err) {
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(uploadsDir, filename);

    // Security: prevent directory traversal
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filepath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(uploadsDir, filename);

    // Security: prevent directory traversal
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
