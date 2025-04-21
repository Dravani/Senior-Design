import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import './SavedCharts.css';

const SavedCharts = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        // Get current user from session storage
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        const username = currentUser?.username || '';
        
        // Fetch charts for this user if logged in
        const url = username ? 
          `http://localhost:3000/api/charts?username=${encodeURIComponent(username)}` : 
          'http://localhost:3000/api/charts';
          
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        console.log('Fetched charts:', data); // Debug log
        setCharts(data);
      } catch (error) {
        console.error('Error fetching charts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, []);

  const handleChartClick = (chart) => {
    console.log('Selected chart:', chart); // Debug log
    setSelectedChart(chart);
  };

  const handleDeleteChart = async (id, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chart?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/charts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      // Remove the chart from the state
      setCharts(charts.filter(chart => chart.id !== id));
      if (selectedChart && selectedChart.id === id) {
        setSelectedChart(null);
      }
      
    } catch (error) {
      console.error('Error deleting chart:', error);
      alert('Failed to delete chart');
    }
  };

  const handleEditChart = (chart, e) => {
    e.stopPropagation();
    // Store more complete information for editing
    const editData = {
      ...chart,
      isEditMode: true
    };
    localStorage.setItem('editChart', JSON.stringify(editData));
    navigate(`/projects/${chart.project_id}`);
  };

  return (
    <div className="saved-charts">
      <div className="dash-title">
        <h1>Saved Charts</h1>
        <h2><span className="underline">Your Chart Library</span></h2>
      </div>

      <div className="charts-container">
        <div className="charts-list">
          {loading ? (
            <div className="loading">Loading charts...</div>
          ) : charts.length === 0 ? (
            <div className="no-charts">
              <p>You haven't saved any charts yet.</p>
              <button onClick={() => navigate('/projects')}>Create a Chart</button>
            </div>
          ) : (
            charts.map(chart => (
              <div
                key={chart.id}
                className={`chart-item ${selectedChart && selectedChart.id === chart.id ? 'selected' : ''}`}
                onClick={() => handleChartClick(chart)}
              >
                <h3>{chart.name}</h3>
                <p>{chart.title}</p>
                <p className="chart-date">
                  {new Date(chart.created_at).toLocaleDateString()}
                </p>
                <div className="chart-actions">
                  <button 
                    className="edit-button"
                    onClick={(e) => handleEditChart(chart, e)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={(e) => handleDeleteChart(chart.id, e)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chart-preview">
          {selectedChart ? (
            <div className="selected-chart">
              <h2>{selectedChart.name}</h2>
              <div className="chart-container">
                {/* Fix how we're passing chart data to the Line component */}
                {selectedChart.config && (
                  <Line 
                    data={selectedChart.config}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: selectedChart.title
                        }
                      }
                    }}
                  />
                )}
              </div>
              <div className="chart-details">
                <p><strong>Created:</strong> {new Date(selectedChart.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selectedChart.updated_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a chart to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedCharts;
