import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

const NavigationApp = () => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState(false);

  // Sample routes data with risk predictions
  const sampleRoutes = [
    {
      id: 1,
      name: 'Express Route',
      distance: '12.5 km',
      duration: '18 minutes',
      riskLevel: 'CRITICAL',
      riskScore: 82,
      riskZones: [
        { location: 'Colombo Junction', risk: 'CRITICAL', score: 87, distance: '2 km', tip: 'Reduce speed during peak hours' },
        { location: 'Galle Road', risk: 'HIGH', score: 71, distance: '8 km', tip: 'Watch for heavy traffic' }
      ],
      color: '#dc2626',
      status: '⚠️ Not Recommended - High Risk'
    },
    {
      id: 2,
      name: 'Scenic Route',
      distance: '14.8 km',
      duration: '22 minutes',
      riskLevel: 'MEDIUM',
      riskScore: 56,
      riskZones: [
        { location: 'Kandy Road', risk: 'MEDIUM', score: 58, distance: '5 km', tip: 'Moderate traffic expected' }
      ],
      color: '#ffa500',
      status: '⚡ Moderate Risk - Acceptable'
    },
    {
      id: 3,
      name: 'Safe Route (Recommended)',
      distance: '16.2 km',
      duration: '24 minutes',
      riskLevel: 'LOW',
      riskScore: 38,
      riskZones: [
        { location: 'Bypass Road', risk: 'LOW', score: 25, distance: '3 km', tip: 'Generally safe, clear roads' },
        { location: 'Outer Ring', risk: 'LOW', score: 31, distance: '10 km', tip: 'Low incident zone' }
      ],
      color: '#10b981',
      recommended: true,
      status: '✅ Recommended - Safest Route'
    }
  ];

  const handleCalculateRoute = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate route calculation with ML risk predictions
    setTimeout(() => {
      setRoutes(sampleRoutes);
      setSelectedRoute(sampleRoutes[2]); // Default to safe route
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.dashboardContainer}>
      {!mapView ? (
        <>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ margin: '0 0 8px 0', color: '#e5e7eb', fontSize: '32px', fontWeight: '700' }}>
              🛣️ Safe Route Navigator
            </h1>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '16px' }}>
              AI-powered navigation with accident risk predictions
            </p>
          </div>

          {/* Route Search */}
          <div className={styles.card} style={{ marginBottom: '24px' }}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🚗</span>
              Find Safer Routes
            </h2>
            
            <form onSubmit={handleCalculateRoute} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Starting Point
                </label>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="Enter starting location"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#162a3f',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Destination
                </label>
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="Enter destination"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#162a3f',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading ? '#4b5563' : '#06b6d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                {loading ? '⏳ Calculating...' : '🔍 Calculate'}
              </button>
            </form>
          </div>

          {/* Routes Display */}
          {routes.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              {routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedRoute?.id === route.id ? '#162a3f' : '#0f1621',
                    border: `2px solid ${route.color}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: selectedRoute?.id === route.id ? 1 : 0.7
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, color: '#e5e7eb', fontSize: '18px', fontWeight: '600' }}>
                          {route.name}
                        </h3>
                        {route.recommended && (
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            ⭐ Recommended
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '8px 0', color: '#9ca3af', fontSize: '14px' }}>
                        {route.distance} • {route.duration}
                      </p>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>{route.status}</p>
                    </div>
                    
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: route.color,
                        marginBottom: '4px'
                      }}>
                        {route.riskScore}%
                      </div>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
                        Risk Score
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Route Details */}
          {selectedRoute && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>⚠️</span>
                Risk Zones on {selectedRoute.name}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {selectedRoute.riskZones.map((zone, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      backgroundColor: '#162a3f',
                      borderRadius: '8px',
                      border: `1px solid ${
                        zone.risk === 'CRITICAL' ? '#dc2626' :
                        zone.risk === 'HIGH' ? '#ffa500' :
                        zone.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'
                      }`,
                      borderLeft: `4px solid ${
                        zone.risk === 'CRITICAL' ? '#dc2626' :
                        zone.risk === 'HIGH' ? '#ffa500' :
                        zone.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'
                      }`
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#e5e7eb', fontSize: '15px', fontWeight: '600' }}>
                          📍 {zone.location}
                        </h4>
                        <p style={{ margin: '4px 0', color: '#9ca3af', fontSize: '13px' }}>
                          At {zone.distance} • {zone.tip}
                        </p>
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#0f1621',
                        borderRadius: '6px',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                          {zone.score}%
                        </div>
                        <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '11px' }}>Risk</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setMapView(true)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                🗺️ View on Map
              </button>
            </div>
          )}
        </>
      ) : (
        // Map View
        <div>
          <button
            onClick={() => setMapView(false)}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Routes
          </button>
          
          <div className={styles.card}>
            <div style={{
              height: '600px',
              backgroundColor: '#162a3f',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '18px' }}>Interactive Map View</p>
                <div style={{ fontSize: '14px', color: '#6b7280', maxWidth: '300px' }}>
                  <p>• Route visualization with risk overlays</p>
                  <p>• Real-time incident markers</p>
                  <p>• Weather impact zones</p>
                  <p>• Alternative route suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer} style={{ marginTop: '40px' }}>
        <p className={styles.footerText}>
          🛣️ Safe Route Navigator | ML-Powered Risk Predictions | Drive Safe, Arrive Safe
        </p>
      </footer>
    </div>
  );
};

export default NavigationApp;
