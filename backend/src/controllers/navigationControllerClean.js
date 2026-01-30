const axios = require('axios');
const db = require('../config/database');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

exports.getSafeRoute = async (req, res) => {
  const { origin, destination, avoid_high_risk = true, current_conditions } = req.body;

  try {
    const aiResp = await axios.post(`${AI_SERVICE_URL}/navigation/safe-route`, {
      origin,
      destination,
      avoid_high_risk,
      current_conditions: current_conditions || { timestamp: new Date().toISOString() }
    }, { timeout: 10000 });

    if (aiResp.data && aiResp.data.success) return res.json({ ...aiResp.data, powered_by: 'AcciNex AI' });
  } catch (err) {
    console.warn('AI safe-route call failed, falling back to Google Maps:', err.message);
  }

  try {
    const directionsResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        alternatives: true
      }
    });

    const routes = directionsResponse.data.routes.map((route, index) => ({
      route_index: index,
      google_route_data: route,
      safety_analysis: { overall_risk_score: 50, warnings: ['AI unavailable'], is_recommended: index === 0 },
      total_distance: route.legs[0].distance.text,
      total_duration: route.legs[0].duration.text,
      recommended: index === 0
    }));

    return res.json({ success: true, routes, safety_summary: 'Fallback Google Maps routing' });
  } catch (err) {
    console.error('Fallback routing failed:', err.message);
    return res.status(500).json({ error: 'Route calculation failed' });
  }
};

exports.getAlertsForArea = async (req, res) => {
  const { latitude, longitude, radius = 1 } = req.query;

  try {
    const aiResp = await axios.post(`${AI_SERVICE_URL}/alerts/area-check`, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_km: parseFloat(radius),
      current_conditions: { timestamp: new Date().toISOString() }
    }, { timeout: 8000 });

    if (aiResp.data && aiResp.data.success) return res.json({ alerts: aiResp.data.alerts, count: aiResp.data.alerts.length, powered_by: 'AcciNex AI' });
  } catch (err) {
    console.warn('AI area-check failed, using DB fallback:', err.message);
  }

  try {
    const result = await db.query(
      `SELECT hr.*, ST_Distance(ST_SetSRID(ST_MakePoint(hr.center_lng, hr.center_lat),4326)::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography)/1000 AS distance_km
       FROM hotspot_regions hr
       WHERE ST_DWithin(ST_SetSRID(ST_MakePoint(hr.center_lng, hr.center_lat),4326)::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3*1000)
       ORDER BY distance_km`,
      [parseFloat(longitude), parseFloat(latitude), parseFloat(radius)]
    );

    return res.json({ alerts: result.rows, count: result.rows.length, powered_by: 'DB Fallback' });
  } catch (err) {
    console.error('DB hotspot query failed:', err.message);
    return res.status(500).json({ error: 'Failed to get area alerts' });
  }
};

exports.getRealTimeAlerts = async (req, res) => {
  const { user_id, latitude, longitude, speed_kmh } = req.body;

  try {
    const aiResp = await axios.post(`${AI_SERVICE_URL}/alerts/real-time`, {
      user_id,
      location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      conditions: { timestamp: new Date().toISOString(), speed_kmh: speed_kmh || null }
    }, { timeout: 8000 });

    if (aiResp.data && aiResp.data.alert_triggered) {
      try {
        await db.query(`INSERT INTO alert_logs (user_id, alert_type, location, risk_score, alert_message, timestamp) VALUES ($1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326),$5,$6,$7)`,
          [user_id, 'real_time_risk', parseFloat(longitude), parseFloat(latitude), aiResp.data.alert.risk_score, aiResp.data.alert.message, new Date()]);
      } catch (logErr) {
        console.warn('Failed to log alert:', logErr.message);
      }
    }

    return res.json(aiResp.data);
  } catch (err) {
    console.error('Real-time alerts error:', err.message);
    return res.status(500).json({ error: 'Real-time alert check failed' });
  }
};

exports.reportFalseAlert = async (req, res) => {
  const { alert_id, user_id, reason, location } = req.body;

  try {
    await db.query(`INSERT INTO false_alert_reports (alert_id, user_id, reason, location, reported_at) VALUES ($1,$2,$3,ST_SetSRID(ST_MakePoint($4,$5),4326),$6)`,
      [alert_id, user_id, reason, location.lng, location.lat, new Date()]);

    try {
      await axios.post(`${AI_SERVICE_URL}/feedback/false-alert`, { alert_id, user_id, reason, location });
    } catch (fbErr) {
      console.warn('Failed to send feedback to AI service:', fbErr.message);
    }

    return res.json({ message: 'Feedback recorded' });
  } catch (err) {
    console.error('False alert report error:', err.message);
    return res.status(500).json({ error: 'Failed to record feedback' });
  }
};

exports.searchNearbyEmergencyServices = async (req, res) => {
  const { latitude, longitude, radius_km = 5 } = req.query;

  try {
    const aiResp = await axios.post(`${AI_SERVICE_URL}/navigation/nearby-emergency`, {
      location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      radius_meters: parseFloat(radius_km) * 1000
    }, { timeout: 8000 });

    if (aiResp.data && aiResp.data.success) return res.json(aiResp.data);
  } catch (err) {
    console.warn('AI emergency search failed, using DB fallback:', err.message);
  }

  try {
    const result = await db.query(`SELECT id, name, service_type, latitude, longitude, phone_number, is_24_hours FROM emergency_services WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)`, [parseFloat(longitude), parseFloat(latitude), parseFloat(radius_km) * 1000]);
    return res.json({ success: true, results: result.rows });
  } catch (err) {
    console.error('DB emergency search failed:', err.message);
    return res.status(500).json({ error: 'Failed to find nearby emergency services' });
  }
};

*** End Patch