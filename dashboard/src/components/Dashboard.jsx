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
  const [heatmapData, setHeatmapData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [patternData, setPatternData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
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

  // Load analytics data when tab changes or reports update
  useEffect(() => {
    if (reports.length > 0) {
      if (activeTab === 'heatmap') {
        fetchHeatmapData();
      } else if (activeTab === 'predictions') {
        fetchForecastData();
      } else if (activeTab === 'analytics') {
        fetchPatternData();
      } else if (activeTab === 'hotspots') {
        fetchHotspots();
      }
    }
  }, [activeTab, reports.length]);

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
      if (reports.length === 0) return;
      const response = await fetch('http://localhost:5000/detect-hotspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reports)
      });
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

  const fetchHeatmapData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('http://localhost:5000/heatmap-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accidents: reports,
          grid_size: 0.01
        })
      });
      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data.heatmap_cells || []);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchForecastData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('http://localhost:5000/forecast-accidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periods: 7,
          accidents: reports
        })
      });
      if (response.ok) {
        const data = await response.json();
        setForecastData(data.forecast || []);
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPatternData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('http://localhost:5000/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accidents: reports
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPatternData(data.patterns || {});
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoadingData(false);
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
        <TabButton name="heatmap" label="🗺️ Heatmap" />
        <TabButton name="predictions" label="🤖 Predictions" />
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

          {loadingData ? (
            <div className={styles.card} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>⏳ Loading pattern analysis...</p>
            </div>
          ) : patternData ? (
            <>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>🔍</span>
                  Pattern Analysis
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#162a3f', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Peak Hour</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                      {patternData.peak_hour ? `${patternData.peak_hour}:00` : 'N/A'}
                    </p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#162a3f', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Peak Day</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ffa500' }}>
                      {patternData.peak_day !== null ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][patternData.peak_day] : 'N/A'}
                    </p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#162a3f', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Total Incidents</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {patternData.total_accidents}
                    </p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#162a3f', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Location Clusters</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                      {Object.keys(patternData.location_clusters || {}).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>📊</span>
                  Severity Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Minor', value: patternData.severity?.minor || 0 },
                        { name: 'Major', value: patternData.severity?.major || 0 },
                        { name: 'Dangerous', value: patternData.severity?.dangerous || 0 }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ffa500" />
                      <Cell fill="#dc2626" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className={styles.card} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>No pattern data available. Create incident reports to generate pattern analysis.</p>
            </div>
          )}

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
                <p style={{ margin: '12px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#059669' }}>{reports.length}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Total incidents in system</p>
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

      {/* TAB: HEATMAP */}
      {activeTab === 'heatmap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🗺️</span>
              Accident Density Heatmap
            </h2>
            {loadingData ? (
              <div style={{ height: '500px', backgroundColor: '#162a3f', borderRadius: '12px', padding: '20px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                  <p style={{ color: '#9ca3af' }}>Loading heatmap data...</p>
                </div>
              </div>
            ) : heatmapData.length === 0 ? (
              <div style={{ height: '500px', backgroundColor: '#162a3f', borderRadius: '12px', padding: '20px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                  <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Real-time accident density visualization</p>
                  <div style={{ fontSize: '18px', color: '#06b6d4', fontWeight: 'bold', marginBottom: '8px' }}>No incident data yet</div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Create incident reports to see heatmap data. Grid-based intensity shows accident concentration zones.</p>
                </div>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.tableHeadCell}>Latitude</th>
                      <th className={styles.tableHeadCell}>Longitude</th>
                      <th className={styles.tableHeadCell}>Incidents</th>
                      <th className={styles.tableHeadCell}>Intensity</th>
                      <th className={styles.tableHeadCell}>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((cell, idx) => {
                      const intensity = cell.intensity || 0;
                      const riskColor = intensity > 50 ? '#dc2626' : intensity > 25 ? '#ffa500' : '#10b981';
                      const riskLevel = intensity > 50 ? 'CRITICAL' : intensity > 25 ? 'MEDIUM' : 'LOW';
                      return (
                        <tr key={idx} className={styles.tableRow}>
                          <td className={styles.tableCell}>{cell.latitude?.toFixed(4)}</td>
                          <td className={styles.tableCell}>{cell.longitude?.toFixed(4)}</td>
                          <td className={styles.tableCell}><strong>{cell.incident_count}</strong></td>
                          <td className={styles.tableCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: riskColor, width: `${intensity}%` }}></div>
                              </div>
                              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{intensity.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <span style={{ color: riskColor, fontWeight: '600', fontSize: '12px' }}>{riskLevel}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px', border: '2px solid #dc2626', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>🔴 CRITICAL</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>High Density</p>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Intensity > 50%</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px', border: '2px solid #ffa500', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>🟠 MEDIUM</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#ffa500' }}>Moderate Density</p>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Intensity 25-50%</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px', border: '2px solid #10b981', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>🟢 LOW</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#10b981' }}>Low Density</p>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Intensity &lt; 25%</p>
              </div>
            </div>
            {heatmapData.length > 0 && (
              <p style={{ marginTop: '20px', color: '#9ca3af', fontSize: '13px' }}>
                Total cells analyzed: {heatmapData.length} | Total incidents in heatmap: {heatmapData.reduce((sum, cell) => sum + (cell.incident_count || 0), 0)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: PREDICTIONS */}
      {activeTab === 'predictions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🤖</span>
              Predictive Risk Analysis
            </h2>
            {loadingData ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <p>⏳ Loading forecast data...</p>
              </div>
            ) : forecastData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', marginBottom: '20px' }}>No forecast data available yet</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Create incident reports to generate 7-day accident forecasts using ML time-series models.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div style={{ padding: '24px', backgroundColor: '#162a3f', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#e5e7eb', fontSize: '16px', fontWeight: '600' }}>7-Day Forecast 📈</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                    {forecastData.slice(0, 7).map((forecast, idx) => {
                      const date = new Date(forecast.ds);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const predictedCount = Math.round(forecast.yhat || 0);
                      return (
                        <div key={idx} style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                          <p style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>{dayName}</p>
                          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>{predictedCount}</p>
                          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '11px' }}>incidents</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '24px', backgroundColor: '#162a3f', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#e5e7eb', fontSize: '16px', fontWeight: '600' }}>Trend Analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px' }}>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Total Predicted</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {forecastData.reduce((sum, d) => sum + Math.round(d.yhat || 0), 0)}
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>incidents in 7 days</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#0f1621', borderRadius: '8px' }}>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Model Confidence</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>85%</p>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>based on historical data</p>
                    </div>
                  </div>
                </div>
              </div>
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
