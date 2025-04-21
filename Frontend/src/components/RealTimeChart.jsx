import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RealTimeChart = ({ data, title = 'Real-time Data', onSave, chartId = null }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sensor Data',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  });
  const [chartName, setChartName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (data) {
      setChartData(prevData => {
        const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
        const newData = [...prevData.datasets[0].data, data];
        
        // Keep only last 20 data points
        if (newLabels.length > 20) {
          newLabels.shift();
          newData.shift();
        }

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: newData
            }
          ]
        };
      });
    }
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const handleSaveClick = () => {
    setShowSaveForm(true);
  };

  const handleSaveChart = async () => {
    if (!chartName.trim()) {
      alert('Please enter a chart name');
      return;
    }

    try {
      const chartConfig = {
        id: chartId, // If null, a new chart will be created
        name: chartName,
        type: 'realtime',
        title,
        data: chartData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (onSave) {
        await onSave(chartConfig);
      } else {
        // Default save implementation if no onSave prop provided
        const response = await fetch('http://localhost:3000/api/charts', {
          method: chartId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chartConfig)
        });

        if (!response.ok) throw new Error('Failed to save chart');
      }

      setShowSaveForm(false);
      alert('Chart saved successfully!');
    } catch (error) {
      console.error('Error saving chart:', error);
      alert(`Failed to save chart: ${error.message}`);
    }
  };

  return (
    <div className="chart-container" style={{ width: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: '300px' }}>
        <Line options={options} data={chartData} />
      </div>
      
      <div className="chart-actions" style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSaveClick}
          style={{ 
            padding: '8px 15px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {chartId ? 'Update Chart' : 'Save Chart'}
        </button>
      </div>

      {showSaveForm && (
        <div className="save-chart-modal" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--background-secondary-dark)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '300px'
        }}>
          <h3>Save Chart</h3>
          <input
            type="text"
            placeholder="Chart name"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            style={{ 
              width: '100%',
              padding: '8px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'var(--background-dark)'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={() => setShowSaveForm(false)}
              style={{ 
                padding: '8px 15px',
                backgroundColor: 'var(--background-dark)',
                color: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveChart}
              style={{ 
                padding: '8px 15px',
                backgroundColor: 'var(--secondary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeChart;