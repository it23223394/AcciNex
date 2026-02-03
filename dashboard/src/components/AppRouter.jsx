import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import NavigationApp from './components/NavigationApp';

const AppRouter = () => {
  const [currentApp, setCurrentApp] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1621' }}>
      {/* App Switcher */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#1a2a3e',
        borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        padding: '12px 20px',
        zIndex: 1000,
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setCurrentApp('dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentApp === 'dashboard' ? '#06b6d4' : '#162a3f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.3s'
          }}
        >
          📊 Authority Dashboard
        </button>
        <button
          onClick={() => setCurrentApp('navigation')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentApp === 'navigation' ? '#06b6d4' : '#162a3f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.3s'
          }}
        >
          🛣️ Public Navigation
        </button>
      </div>

      {/* App Content */}
      {currentApp === 'dashboard' ? <Dashboard /> : <NavigationApp />}
    </div>
  );
};

export default AppRouter;
