import React from 'react';
import GrafanaPanel from './GrafanaPanel';
import './Dashboard.css';

const Dashboard = () => {
  // Replace these URLs with your actual Grafana dashboard URLs
  const GRAFANA_BASE_URL = process.env.REACT_APP_GRAFANA_URL || 'http://localhost:3000';
  
  const dashboards = [
    {
      id: 'temperature',
      title: 'Temperature Dashboard',
      url: `${GRAFANA_BASE_URL}/d/your-dashboard-id/temperature?orgId=1&refresh=5s`,
    },
    {
      id: 'humidity',
      title: 'Humidity Dashboard',
      url: `${GRAFANA_BASE_URL}/d/your-dashboard-id/humidity?orgId=1&refresh=5s`,
    },
    {
      id: 'pressure',
      title: 'Pressure Dashboard',
      url: `${GRAFANA_BASE_URL}/d/your-dashboard-id/pressure?orgId=1&refresh=5s`,
    },
  ];

  return (
    <div className="dashboard">
      <h1>Sensor Dashboard</h1>
      <div className="panels-grid">
        {dashboards.map((dashboard) => (
          <GrafanaPanel
            key={dashboard.id}
            title={dashboard.title}
            dashboardUrl={dashboard.url}
            height="400px"
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 