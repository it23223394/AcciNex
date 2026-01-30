const db = require('../config/database');
const axios = require('axios');

exports.createReport = async (req, res) => {
  const { latitude, longitude, accident_time, severity, weather_condition, vehicle_count, description } = req.body;
  const officer_id = req.user.id;
  const report_id = `ACC-${Date.now()}`;

  try {
    // 1. Save report to DB
    const result = await db.query(
      `INSERT INTO accident_reports 
      (report_id, officer_id, location, latitude, longitude, accident_time, severity, weather_condition, vehicle_count, description) 
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $4, $3, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [report_id, officer_id, longitude, latitude, accident_time, severity, weather_condition, vehicle_count, description]
    );

    const report = result.rows[0];

    // 2. Call AI service for severity prediction validation or update hotspots
    // This could be async or via a message queue in production
    try {
        await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:5000'}/detect-hotspots`, [report]);
    } catch (aiErr) {
        console.error('AI Service Error:', aiErr.message);
    }

    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accident_reports ORDER BY accident_time DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM accident_reports WHERE report_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
