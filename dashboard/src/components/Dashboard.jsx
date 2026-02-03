import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import styles from './Dashboard.module.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Traffic Police');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Invalid email or password');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin();
    } catch (err) {
      setError('Error logging in: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'traffic_police', department })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Registration failed');
        return;
      }

      const data = await response.json();
      alert('Registration successful! Please login with your credentials.');
      setIsRegister(false);
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setError('Error registering: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.loginTitle}>🚔 AcciNex</h1>
          <p className={styles.loginSubtitle}>Road Safety Intelligence Platform</p>
          
          {!isRegister ? (
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className={styles.alertDanger} style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px' }}>{error}</div>}

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? '🔐 Logging in...' : '🔐 Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Username</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Department</label>
                <select 
                  className={styles.formInput}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option>Traffic Police</option>
                  <option>Emergency Services</option>
                  <option>Road Safety</option>
                  <option>Public Safety</option>
                </select>
              </div>

              {error && <div className={styles.alertDanger} style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px' }}>{error}</div>}

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? '⏳ Creating Account...' : '✅ Create Account'}
              </button>
            </form>
          )}

          <div className={styles.authLinks}>
            {!isRegister ? (
              <>
                <p className={styles.authText}>
                  Don't have an account? <button type="button" className={styles.linkButton} onClick={() => setIsRegister(true)}>Create one</button>
                </p>
              </>
            ) : (
              <p className={styles.authText}>
                Already have an account? <button type="button" className={styles.linkButton} onClick={() => setIsRegister(false)}>Login</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthorityDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchReports();
      fetchHotspots();
      fetchAlerts();
    }
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

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Tab Component
  const TabButton = ({ name, label }) => (
    <button
      className={`${styles.tabButton} ${activeTab === name ? styles.active : ''}`}
      onClick={() => setActiveTab(name)}
    >
      {label}
    </button>
  );

  // Status Badge Component
  const StatusBadge = ({ severity }) => {
    const chipClass = {
      minor: styles.chipMinor,
      major: styles.chipMajor,
      dangerous: styles.chipDangerous
    }[severity] || styles.chipMinor;
    
    return (
      <span className={`${styles.statusChip} ${chipClass}`}>
        <span className={styles.chipDot}></span>
        {severity.toUpperCase()}
      </span>
    );
  };

  // KPI Card Component
  const KPICard = ({ label, value, meta, icon }) => (
    <div className={styles.kpiCard}>
      <h3 className={styles.kpiLabel}>{icon} {label}</h3>
      <p className={styles.kpiValue}>{value}</p>
      {meta && <div className={styles.kpiMeta}>
        <div className={styles.statusIndicator}></div>
        {meta}
      </div>}
    </div>
  );

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <header className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.mainTitle}>🚔 AcciNex – Authority Dashboard</h1>
            <p className={styles.subtitle}>Predictive road safety intelligence | Real-time accident tracking & prevention</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        <KPICard 
          icon="📍" 
          label="Incidents Today" 
          value={reports.length} 
          meta="Real-time tracking"
        />
        <KPICard 
          icon="🔥" 
          label="Risk Hotspots" 
          value={hotspots.length} 
          meta="Monitored zones"
        />
        <KPICard 
          icon="⏱️" 
          label="Avg Response" 
          value="15 min" 
          meta="Target: <20 min"
        />
        <KPICard 
          icon="⚠️" 
          label="Active Alerts" 
          value={alerts.length} 
          meta="Requires attention"
        />
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabContainer}>
        <TabButton name="overview" label="📊 Overview" />
        <TabButton name="reports" label="📋 Create Report" />
        <TabButton name="images" label="🖼️ Evidence" />
        <TabButton name="analytics" label="📈 Analytics" />
        <TabButton name="hotspots" label="🔥 Hotspots" />
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={styles.gridTwoCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📊</span>
              Severity Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.severity_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  <Cell fill="#1e3a8a" />
                  <Cell fill="#ea580c" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>⏰</span>
              Hourly Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.hourly_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <Bar dataKey="accidents" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: CREATE REPORT */}
      {activeTab === 'reports' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>📋</span>
            Report New Incident
          </h2>
          <form onSubmit={handleCreateReport} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Latitude</label>
              <input 
                className={styles.formInput}
                type="number" 
                step="0.0001" 
                value={formData.latitude} 
                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Longitude</label>
              <input 
                className={styles.formInput}
                type="number" 
                step="0.0001" 
                value={formData.longitude} 
                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Severity Level</label>
              <select 
                className={styles.formSelect}
                value={formData.severity} 
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
              >
                <option>minor</option>
                <option>major</option>
                <option>dangerous</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weather Condition</label>
              <select 
                className={styles.formSelect}
                value={formData.weather_condition} 
                onChange={(e) => setFormData({...formData, weather_condition: e.target.value})}
              >
                <option>clear</option>
                <option>rainy</option>
                <option>foggy</option>
                <option>snowy</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vehicle Count</label>
              <input 
                className={styles.formInput}
                type="number" 
                value={formData.vehicle_count} 
                onChange={(e) => setFormData({...formData, vehicle_count: parseInt(e.target.value)})} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Incident Time</label>
              <input 
                className={styles.formInput}
                type="datetime-local" 
                value={formData.accident_time.slice(0, 16)} 
                onChange={(e) => setFormData({...formData, accident_time: new Date(e.target.value).toISOString()})} 
              />
            </div>
            <div className={styles.formGroup + ' ' + styles.gridFullWidth}>
              <label className={styles.formLabel}>Incident Description</label>
              <textarea 
                className={styles.formTextarea}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <button 
              type="submit" 
              className={styles.submitButton + ' ' + styles.gridFullWidth}
            >
              📤 Submit Report
            </button>
          </form>
          <button 
            onClick={handleCheckAlerts} 
            className={styles.submitButton + ' ' + styles.gridFullWidth}
            style={{ marginTop: '12px', background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}
          >
            🚨 Check Location Alerts
          </button>
        </div>
      )}

      {/* TAB: IMAGE UPLOAD */}
      {activeTab === 'images' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>🖼️</span>
            Upload Evidence with GPS Verification
          </h2>
          <form onSubmit={handleImageUpload}>
            <div className={styles.dropZone}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                style={{ display: 'none' }} 
                id="imageInput" 
              />
              <label htmlFor="imageInput" className={styles.dropZoneText}>
                📁 Drop image here or click to browse
              </label>
              {imageFile && <p className={styles.dropZoneFile}>✅ {imageFile.name}</p>}
            </div>
            <button 
              type="submit" 
              disabled={uploadingImage} 
              className={styles.submitButton}
              style={{ width: '100%' }}
            >
              {uploadingImage ? '⏳ Processing...' : '🖼️ Upload & Extract GPS'}
            </button>
          </form>
          <div className={styles.alertBox + ' ' + styles.alertInfo + ' ' + styles.mt_6}>
            <strong>🔍 Automated GPS Verification</strong>
            <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px' }}>
              <li>Extracts GPS from EXIF metadata automatically</li>
              <li>Validates coordinate accuracy & bounds</li>
              <li>Links evidence to incident reports</li>
              <li>Supports JPEG & PNG (max 10MB)</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📈</span>
              Trend Analysis (30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Incidents" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="danger_rate" stroke="#dc2626" name="Risk Level" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📊</span>
              Performance Metrics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02))', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Avg Response Time</p>
                <p style={{ margin: '12px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>15 min</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Target: ≤20 min ✓</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.02))', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Reports This Month</p>
                <p style={{ margin: '12px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#059669' }}>127</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>+12% from last month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HOTSPOTS & ALERTS */}
      {activeTab === 'hotspots' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🔥</span>
              High-Risk Hotspots
            </h2>
            {hotspots.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🗺️</div>
                <p className={styles.emptyStateText}>No hotspots detected. System monitoring in progress.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Location</th>
                    <th className={styles.tableHeadCell}>Risk Level</th>
                    <th className={styles.tableHeadCell}>Incidents</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((hs, idx) => (
                    <tr key={idx} className={styles.tableRow}>
                      <td className={styles.tableCell}>📍 {hs.lat.toFixed(4)}, {hs.lng.toFixed(4)}</td>
                      <td className={styles.tableCell}><span className={`${styles.statusChip} ${styles.chipDangerous}`}>{hs.risk_level}</span></td>
                      <td className={styles.tableCell}><strong>{hs.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>⚠️</span>
              Active Alerts
            </h2>
            {alerts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🛡️</div>
                <p className={styles.emptyStateText}>No active alerts in your area.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Alert Type</th>
                    <th className={styles.tableHeadCell}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr key={idx} className={styles.tableRow}>
                      <td className={styles.tableCell}>⚡ {alert.name}</td>
                      <td className={styles.tableCell}><strong>{alert.distance_km?.toFixed(2) || 'N/A'} km</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <section className={styles.card} style={{ marginTop: '32px' }}>
        <h3 className={styles.cardTitle}>
          <span className={styles.cardIcon}>📋</span>
          Recent Incident Reports
        </h3>
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📊</div>
            <p className={styles.emptyStateText}>No reports yet. Create one to get started.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Report ID</th>
                <th className={styles.tableHeadCell}>Location</th>
                <th className={styles.tableHeadCell}>Severity</th>
                <th className={styles.tableHeadCell}>Time</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map(report => (
                <tr key={report.report_id} className={styles.tableRow}>
                  <td className={styles.tableCell}><strong>#{report.report_id}</strong></td>
                  <td className={styles.tableCell}>📍 {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</td>
                  <td className={styles.tableCell}>
                    <StatusBadge severity={report.severity} />
                  </td>
                  <td className={styles.tableCell}>{new Date(report.accident_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>AcciNex - Predict, Prevent, Protect | Backend: 3000 | AI: 5000 | Dashboard: 3001</p>
      </footer>
        </div>
      )}
    </>
  );
};

export default AuthorityDashboard;
