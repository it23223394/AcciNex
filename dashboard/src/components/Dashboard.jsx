import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

const AuthorityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [formData, setFormData] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    accident_time: new Date().toISOString(),
    severity: 'major',
    weather_condition: 'clear',
    vehicle_count: 2,
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    today_accidents: 1,
    avg_response_time: 15,
    severity_distribution: [
      { name: 'Minor', value: 45 },
      { name: 'Major', value: 30 },
      { name: 'Dangerous', value: 25 }
    ],
    hourly_distribution: [
      { hour: '08:00', accidents: 5 },
      { hour: '12:00', accidents: 8 },
      { hour: '18:00', accidents: 12 },
      { hour: '20:00', accidents: 7 }
    ],
    trends: [
      { date: '2026-01-30', count: 1, danger_rate: 0 }
    ]
  });

  useEffect(() => {
    fetchReports();
    fetchHotspots();
    fetchAlerts();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchHotspots = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/hotspots');
      if (response.ok) {
        const data = await response.json();
        setHotspots(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching hotspots:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/navigation/alerts?latitude=6.9271&longitude=79.8612&radius=5');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Report created successfully!');
        setFormData({
          latitude: 6.9271,
          longitude: 79.8612,
          accident_time: new Date().toISOString(),
          severity: 'major',
          weather_condition: 'clear',
          vehicle_count: 2,
          description: ''
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      formDataObj.append('image', imageFile);

      const response = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Image uploaded! GPS: ${data.gps_data?.latitude}, ${data.gps_data?.longitude}`);
        setImageFile(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/check-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: formData.latitude,
          longitude: formData.longitude,
          weather: formData.weather_condition
        })
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Alerts: ${data.alerts.length} found`);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  // Tab Component
  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      style={{
        padding: '12px 20px',
        backgroundColor: activeTab === name ? '#3182ce' : '#e2e8f0',
        color: activeTab === name ? '#fff' : '#000',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '5px',
        transition: 'all 0.3s'
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a1a', margin: 0 }}>🚔 AcciNex Authority Dashboard</h1>
        <p style={{ color: '#666', margin: '10px 0 0 0' }}>Real-time accident tracking & predictive intelligence</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>Today's Accidents</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#e53e3e' }}>{reports.length}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>Active Hotspots</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#d69e2e' }}>{hotspots.length}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>Response Time</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#38a169' }}>15 min</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>Alerts</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#805ad5' }}>{alerts.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '5px' }}>
        <TabButton name="overview" label="📊 Overview" />
        <TabButton name="reports" label="📋 Create Report" />
        <TabButton name="images" label="🖼️ Image Evidence" />
        <TabButton name="analytics" label="📈 Analytics" />
        <TabButton name="hotspots" label="🔥 Hotspots & Alerts" />
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0 }}>Severity Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.severity_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  <Cell fill="#e53e3e" />
                  <Cell fill="#d69e2e" />
                  <Cell fill="#f6ad55" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0 }}>Hourly Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.hourly_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accidents" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: CREATE REPORT */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2>Create Accident Report</h2>
          <form onSubmit={handleCreateReport} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Latitude:</label>
              <input type="number" step="0.0001" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Longitude:</label>
              <input type="number" step="0.0001" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Severity:</label>
              <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <option>minor</option>
                <option>major</option>
                <option>dangerous</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Weather:</label>
              <select value={formData.weather_condition} onChange={(e) => setFormData({...formData, weather_condition: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <option>clear</option>
                <option>rainy</option>
                <option>foggy</option>
                <option>snowy</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vehicle Count:</label>
              <input type="number" value={formData.vehicle_count} onChange={(e) => setFormData({...formData, vehicle_count: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time:</label>
              <input type="datetime-local" value={formData.accident_time.slice(0, 16)} onChange={(e) => setFormData({...formData, accident_time: new Date(e.target.value).toISOString()})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '100px' }} />
            </div>
            <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>📤 Create Report</button>
          </form>
          <button onClick={handleCheckAlerts} style={{ marginTop: '15px', padding: '12px 20px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚨 Check Alerts for Location</button>
        </div>
      )}

      {/* TAB: IMAGE UPLOAD */}
      {activeTab === 'images' && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2>Upload Evidence Image with GPS</h2>
          <form onSubmit={handleImageUpload}>
            <div style={{ border: '2px dashed #3182ce', padding: '40px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', backgroundColor: '#f0f7ff' }}>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ display: 'none' }} id="imageInput" />
              <label htmlFor="imageInput" style={{ cursor: 'pointer', fontSize: '16px', color: '#3182ce', fontWeight: 'bold' }}>
                📁 Drag & drop image here or click to select
              </label>
              {imageFile && <p style={{ marginTop: '10px', color: '#38a169' }}>✅ Selected: {imageFile.name}</p>}
            </div>
            <button type="submit" disabled={uploadingImage} style={{ width: '100%', padding: '12px', backgroundColor: uploadingImage ? '#ccc' : '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploadingImage ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              {uploadingImage ? '⏳ Uploading...' : '🖼️ Upload Image with GPS Extraction'}
            </button>
          </form>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a' }}>
            <strong>ℹ️ How it works:</strong>
            <ul style={{ margin: '10px 0 0 20px' }}>
              <li>Upload an image taken with a GPS-enabled camera</li>
              <li>Our system automatically extracts GPS coordinates from EXIF data</li>
              <li>Coordinates are verified and stored with your accident report</li>
              <li>Supports JPEG and PNG formats (max 10MB)</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2>Trend Analysis (30 days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3182ce" name="Accidents" />
                <Line yAxisId="right" type="monotone" dataKey="danger_rate" stroke="#e53e3e" name="Danger Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2>Key Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#666' }}>Average Response Time</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>15 minutes</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f0fff4', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#666' }}>Reports This Month</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>127</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HOTSPOTS & ALERTS */}
      {activeTab === 'hotspots' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2>🔥 High-Risk Hotspots</h2>
            {hotspots.length === 0 ? (
              <p style={{ color: '#999' }}>No hotspots detected yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Risk Level</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Accidents</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((hs, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>Lat: {hs.lat}, Lng: {hs.lng}</td>
                      <td style={{ padding: '12px' }}>{hs.risk_level}</td>
                      <td style={{ padding: '12px' }}>{hs.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2>⚠️ Active Alerts</h2>
            {alerts.length === 0 ? (
              <p style={{ color: '#999' }}>No alerts in selected area</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Alert</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{alert.name}</td>
                      <td style={{ padding: '12px' }}>{alert.distance_km?.toFixed(2) || 'N/A'} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <section style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>📋 Recent Accident Reports</h3>
        {reports.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No reports yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Report ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map(report => (
                <tr key={report.report_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>{report.report_id}</strong></td>
                  <td style={{ padding: '12px' }}>{parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: report.severity === 'major' ? '#fed7d7' : report.severity === 'dangerous' ? '#fc8181' : '#feebc8',
                      color: report.severity === 'major' ? '#c53030' : report.severity === 'dangerous' ? '#9b2c2c' : '#7c2d12',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {report.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(report.accident_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#999', fontSize: '12px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
        <p>AcciNex - Predict, Prevent, Protect | Backend: 3000 | AI: 5000 | Dashboard: 3001</p>
      </footer>
    </div>
  );
};

export default AuthorityDashboard;
