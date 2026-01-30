const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const aiController = require('../controllers/aiController');
const navigationController = require('../controllers/navigationController');
const analyticsController = require('../controllers/analyticsController');
const imageController = require('../controllers/imageController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Reports
router.post('/reports', auth, reportController.createReport);
router.get('/reports', auth, reportController.getReports);
router.get('/reports/:id', auth, reportController.getReportById);

// Image Upload
router.post('/images/upload', auth, upload.single('image'), imageController.uploadImage);
router.get('/images/:filename', imageController.getImage);
router.delete('/images/:filename', auth, imageController.deleteImage);

// AI
router.get('/ai/hotspots', aiController.getHotspots);
router.post('/ai/check-alerts', aiController.checkAlerts);

// Navigation
router.post('/navigation/route', navigationController.getSafeRoute);
router.get('/navigation/alerts', navigationController.getAlertsForArea);
router.post('/navigation/alert', navigationController.reportFalseAlert);

// Analytics
router.get('/analytics/summary', auth, analyticsController.getSummary);
router.get('/analytics/trends', auth, analyticsController.getTrends);
router.get('/analytics/heatmap', auth, analyticsController.getHeatmapData);

module.exports = router;
