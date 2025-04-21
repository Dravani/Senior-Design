import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ProjectChart from "../components/ProjectChart";
import { exportChartsToExcel } from "../tools/ExportExcel";

// CSS Stylings
import "./ProjectPage.css";

const defaultSettings = {
    sensorType: "DHT",
    selectedSensors: [],
    sensors: [],
    startTime: "",
    endTime: "",
    liveMode: false,
    dataType: "humidity",
    showOptions: true,
    isFullScreen: false,
};

const ProjectPage = () => {
    const { project_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get project details from navigation state or fetch them
    const [projectName, setProjectName] = useState(location.state?.project_name || "");
    const [description, setDescription] = useState(location.state?.description || "No description provided.");
    const projectId = location.state?.project_id || project_id;
    
    // User information
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const username = currentUser?.username || '';

    // Chart states - Initialize with empty array instead of default chart
    const [chartConfigs, setChartconfigs] = useState([]);
    const [fetchedIndices, setFetchedIndices] = useState(new Set());
    const [chartDataMap, setChartDataMap] = useState({});
    const [savedCharts, setSavedCharts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect to login if no user
    useEffect(() => {
        if (!username) {
            navigate('/login');
        }
    }, [username, navigate]);

    // Fetch project details if not provided in location state
    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectName && projectId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/projects/${projectId}`);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    const project = await response.json();
                    setProjectName(project.name);
                    setDescription(project.description);
                } catch (error) {
                    console.error('Error fetching project details:', error);
                }
            }
        };
        
        fetchProjectDetails();
    }, [projectId, projectName]);

    // Fetch saved charts for this project
    useEffect(() => {
        if (!projectId) return;
        
        const fetchCharts = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/charts/project/${projectId}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                
                const charts = await response.json();
                setSavedCharts(charts);
            } catch (error) {
                console.error('Error fetching project charts:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCharts();
    }, [projectId]);

    useEffect(() => {
        const savedChart = localStorage.getItem('editChart');
        if (savedChart) {
            try {
                const chartData = JSON.parse(savedChart);
                if (chartData && chartData.config) {
                    const convertedConfig = {
                        id: chartData.id,
                        sensorType: chartData.type || "DHT",
                        selectedSensors: chartData.config.datasets.map(ds => ds.sensorName || "Unknown"),
                        sensors: chartData.config.datasets.map(ds => ds.sensorName || "Unknown"),
                        startTime: "",
                        endTime: "",
                        liveMode: false,
                        dataType: chartData.type === "DHT" ? "humidity" : "packet_length",
                        showOptions: true,
                        isFullScreen: false,
                        chartName: chartData.name,
                        title: chartData.title
                    };
                    
                    setChartconfigs([convertedConfig]);
                    setChartDataMap({ 0: chartData.config });
                    localStorage.removeItem('editChart');
                }
            } catch (error) {
                console.error('Error loading saved chart:', error);
            }
        }
    }, []);

    const addChart = () => {
        const newChart = structuredClone(defaultSettings);
        setChartconfigs((prev) => {
            const updated = [...prev, newChart];
            fetchSensors(newChart.sensorType, updated.length - 1);
            return updated;
        });
    };

    const updateChartConfig = (index, key, value) => {
        const newConfigs = [...chartConfigs];
        newConfigs[index][key] = value;
        setChartconfigs(newConfigs);

        if (key === "sensorType") {
            newConfigs[index][key] = value;
            newConfigs[index].selectedSensors = [];
            fetchSensors(value, index);
        } else {
            newConfigs[index][key] = value;
        }
    };

    const handleDownloadAllCharts = () => {
        exportChartsToExcel(chartConfigs, chartDataMap, projectName);
    };

    const saveChartToDatabase = async (index) => {
        const config = chartConfigs[index];
        const data = chartDataMap[index];
        
        if (!config || !data) {
            alert("No chart data to save");
            return;
        }
        
        const chartName = prompt("Enter a name for this chart:", config.chartName || "");
        if (!chartName) return;
        
        try {
            const chartConfig = {
                id: config.id,
                name: chartName,
                type: config.sensorType,
                title: config.title || `${config.sensorType} Chart`,
                data: data,
                project_id: projectId,
                username: username
            };
            
            const url = config.id 
                ? `http://localhost:3000/api/charts/${config.id}` 
                : 'http://localhost:3000/api/charts';
            
            const method = config.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chartConfig)
            });
            
            if (!response.ok) throw new Error('Failed to save chart');
            
            const savedChart = await response.json();
            
            const newConfigs = [...chartConfigs];
            newConfigs[index].id = savedChart.id;
            newConfigs[index].chartName = chartName;
            setChartconfigs(newConfigs);
            
            // Update saved charts list
            if (!config.id) {
                setSavedCharts(prev => [...prev, savedChart]);
            } else {
                setSavedCharts(prev => prev.map(chart => 
                    chart.id === savedChart.id ? savedChart : chart
                ));
            }
            
            alert('Chart saved successfully!');
        } catch (error) {
            console.error('Error saving chart:', error);
            alert(`Failed to save chart: ${error.message}`);
        }
    };

    const fetchSensors = async (sensorType, index) => {
        try {
            let url = sensorType === "DHT" ? "http://localhost:3000/api/sensors" : "http://localhost:3000/api/sensors/network";
            const response = await fetch(url);

            const json = await response.json();
            const uniqueSensors = [...new Set(json.map(sensor => sensorType === "DHT" ? sensor.sensor_name : sensor.ip).filter(Boolean))];

            setChartconfigs(prev => {
                const updated = [...prev];
                updated[index].sensors = uniqueSensors;
                updated[index].selectedSensor = "";
                return updated;
            });
            setFetchedIndices(prev => new Set(prev).add(index));
        } catch (error) {
            console.error("Error fetching sensors: ", error);
        }
    };

    const toggleChartOptions = (index) => {
        const newConfigs = [...chartConfigs];
        newConfigs[index].showOptions = !newConfigs[index].showOptions;
        setChartconfigs(newConfigs);
    };

    const removeChart = (index) => {
        setChartconfigs(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFullscreen = (index) => {
        const newConfigs = [...chartConfigs];
        newConfigs[index].isFullScreen = !newConfigs[index].isFullScreen;
        setChartconfigs(newConfigs);
    };
    
    const loadSavedChart = (chart) => {
        try {
            console.log("Loading saved chart:", chart);
            
            // Extract the chart data from the config property
            const chartConfig = chart.config;
            
            if (!chartConfig || !chartConfig.datasets) {
                console.error("Invalid chart config:", chartConfig);
                alert('Chart data is invalid or corrupted');
                return;
            }
            
            // Find timestamps for proper time range
            let startTime = "";
            let endTime = "";
            
            if (chartConfig.labels && chartConfig.labels.length > 0) {
                startTime = chartConfig.labels[0];
                endTime = chartConfig.labels[chartConfig.labels.length - 1];
            } else if (chartConfig.datasets && chartConfig.datasets[0]?.timestamps) {
                const timestamps = chartConfig.datasets[0].timestamps.filter(t => t);
                if (timestamps.length > 0) {
                    startTime = timestamps[0];
                    endTime = timestamps[timestamps.length - 1];
                }
            }
            
            // Add 1 day buffer if no timestamps found to ensure display
            if (!startTime || !endTime) {
                const now = new Date();
                endTime = now.toISOString();
                now.setDate(now.getDate() - 1);
                startTime = now.toISOString();
            }
            
            // Format timestamps for datetime-local input
            startTime = startTime.substring(0, 16);
            endTime = endTime.substring(0, 16);
            
            const convertedConfig = {
                id: chart.id,
                sensorType: chart.type || "DHT",
                selectedSensors: chartConfig.datasets.map(ds => ds.sensorName || "Unknown"),
                sensors: chartConfig.datasets.map(ds => ds.sensorName || "Unknown"),
                startTime,
                endTime,
                liveMode: false,
                dataType: chart.type === "DHT" ? "humidity" : "packet_length",
                showOptions: false,
                isFullScreen: false,
                chartName: chart.name,
                title: chart.title,
                isEditMode: true  // Mark this chart as in edit mode
            };
            
            // Add the new chart to chartConfigs
            const newIndex = chartConfigs.length;
            setChartconfigs(prevConfigs => [...prevConfigs, convertedConfig]);
            
            // Store the chart data for this new chart using the correct index
            setChartDataMap(prev => ({ 
                ...prev, 
                [newIndex]: chartConfig
            }));
            
        } catch (error) {
            console.error('Error loading saved chart:', error);
            alert('Failed to load chart');
        }
    };
    
    useEffect(() => {
        if (chartConfigs.length > 0) {
            fetchSensors(chartConfigs[0].sensorType, 0);
        }
    }, []);

    const deleteChart = async (index) => {
        const config = chartConfigs[index];
        
        // If chart has no ID, it hasn't been saved to the database
        if (!config.id) {
            removeChart(index);
            return;
        }
        
        if (!confirm(`Are you sure you want to delete the chart "${config.chartName || 'Untitled Chart'}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/charts/${config.id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete chart');
            }
            
            // Remove from saved charts list
            setSavedCharts(prev => prev.filter(chart => chart.id !== config.id));
            
            // Remove from chart configs
            removeChart(index);
            
            alert('Chart deleted successfully');
        } catch (error) {
            console.error('Error deleting chart:', error);
            alert('Failed to delete chart: ' + error.message);
        }
    };
    
    const deleteProject = async () => {
        if (!projectId) {
            alert("Cannot delete project: Missing project ID");
            return;
        }

        if (!confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone and will delete all associated charts.`)) {
            return;
        }
        
        try {
            console.log(`Attempting to delete project with ID: ${projectId}`);
            
            // First, delete all associated charts
            console.log("Deleting all charts associated with this project");
            
            // Option 1: Use the backend to cascade delete (preferred approach)
            const response = await fetch(`http://localhost:3000/api/projects/${projectId}?cascade=true`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Delete response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to delete project (${response.status}): ${errorText || response.statusText}`);
            }
            
            alert('Project and all associated charts deleted successfully');
            navigate('/projects'); // Redirect to projects list
        } catch (error) {
            console.error('Error deleting project:', error);
            alert(`Failed to delete project: ${error.message}`);
        }
    };

    return (
        <div className="project-page">
            <div className="dash-title">
                <h1>{projectName}</h1>
                <h2>{description}</h2>

                <div className="chart-controls">
                    <button onClick={addChart}>Add Chart</button>
                    {chartConfigs.length > 0 && (
                        <button onClick={handleDownloadAllCharts}>Download All Charts</button>
                    )}
                    <button onClick={deleteProject} style={{ backgroundColor: "red", color: "white" }}>Delete Project</button>
                </div>
                
                {/* Show welcome message when no charts are present */}
                {chartConfigs.length === 0 && !loading && (
                    <div className="welcome-container">
                        <div className="welcome-message">
                            <h3>Welcome to your project dashboard!</h3>
                            <p>Click "Add Chart" to create a new visualization or select one of your saved charts below.</p>
                            {savedCharts.length === 0 && (
                                <p className="no-charts-hint">You haven't saved any charts for this project yet.</p>
                            )}
                        </div>
                    </div>
                )}
                
                {savedCharts.length > 0 && (
                    <div className="saved-charts-section">
                        <h3>Saved Charts</h3>
                        <div className="saved-charts-list">
                            {savedCharts.map(chart => (
                                <div 
                                    key={chart.id} 
                                    className="saved-chart-item"
                                    onClick={() => loadSavedChart(chart)}
                                >
                                    <span>{chart.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Only render the charts grid if there are charts */}
                {chartConfigs.length > 0 && (
                    <div className="charts-grid">
                        {chartConfigs.map((config, index) => (
                            <div className={`chart-settings-box ${config.isFullScreen ? "fullscreen" : ""}`} key={index}>
                                <button
                                    className="remove-graph-button"
                                    onClick={() => removeChart(index)}
                                >
                                    ✕
                                </button>

                                <button
                                    className="fullscreen-button"
                                    onClick={() => toggleFullscreen(index)}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "50px", // Adjusted position
                                        backgroundColor: "var(--background-dark)",
                                        color: "white",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {config.isFullScreen ? "Exit" : "Full"}
                                </button>

                                <button
                                    className="toggle-options-button"
                                    onClick={() => toggleChartOptions(index)}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px", // Set to furthest right
                                        backgroundColor: "var(--background-dark)",
                                        color: "white",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    ●●●
                                </button>
                                
                                <button
                                    className="save-chart-button"
                                    onClick={() => saveChartToDatabase(index)}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "100px", // Keep this position
                                        backgroundColor: "var(--secondary-color)",
                                        color: "white",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {config.isEditMode ? "Update" : "Save"}
                                </button>

                                <button
                                    className="delete-chart-button"
                                    onClick={() => deleteChart(index)}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "180px", // Move further left to avoid overlap
                                        backgroundColor: "#e74c3c",
                                        color: "white",
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                                
                                {config.isEditMode && (
                                    <div className="chart-edit-badge" style={{
                                        position: "absolute",
                                        top: "45px",
                                        right: "10px",
                                        backgroundColor: "var(--primary-color)",
                                        color: "white",
                                        padding: "3px 8px",
                                        fontSize: "10px",
                                        borderRadius: "4px"
                                    }}>
                                        Editing chart: {config.chartName}
                                    </div>
                                )

                                }

                                {config.showOptions && (
                                <div className="floating-options">
                                    <select
                                    className="custom-select"
                                    value={config.sensorType}
                                    onChange={(e) => updateChartConfig(index, "sensorType", e.target.value)}
                                    >
                                    <option value="" disabled>Sensor Type</option>
                                    <option value="DHT">DHT</option>
                                    <option value="Network">Network</option>
                                    </select>

                                    <div className="sensor-checkbox-list">
                                        {config.sensors.map((sensor, i) => (
                                            <label key={i} className="sensor-checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={config.selectedSensors.includes(sensor)}
                                                    onChange={(e) => {
                                                        const updatedSensors = e.target.checked ? [...config.selectedSensors, sensor] : config.selectedSensors.filter(s => s !== sensor);
                                                        updateChartConfig(index, "selectedSensors", updatedSensors);
                                                    }}
                                                />
                                                {sensor}
                                            </label>    
                                        ))}
                                    </div>
                                    <div className="time-range">
                                    <div className="input-group">
                                        <label className="time-label">Start Time</label>
                                        <input
                                        className="custom-select"
                                        type="datetime-local"
                                        value={config.startTime}
                                        onChange={(e) => updateChartConfig(index, "startTime", e.target.value)}
                                        />
                                    </div>

                                    <div className="input-group end-time-group">
                                        <label className="time-label">End Time</label>
                                        <div className="end-time-row">
                                        <input
                                            className="custom-select"
                                            type="datetime-local"
                                            value={config.endTime}
                                            disabled={config.liveMode}
                                            onChange={(e) => updateChartConfig(index, "endTime", e.target.value)}
                                        />
                                        <label className="live-toggle-label">
                                            <input
                                            type="checkbox"
                                            checked={config.liveMode}
                                            onChange={(e) => updateChartConfig(index, "liveMode", e.target.checked)}
                                            />
                                            Live
                                        </label>
                                        </div>
                                    </div>
                                    </div>

                                    {config.sensorType === "DHT" && (
                                    <select
                                        className="custom-select"
                                        value={config.dataType}
                                        onChange={(e) => updateChartConfig(index, "dataType", e.target.value)}
                                    >
                                        <option value="" disabled>Data Type</option>
                                        <option value="humidity">Humidity</option>
                                        <option value="temperature">Temperature</option>
                                    </select>
                                    )}
                                </div>
                                )}
                                {config.selectedSensors.length > 0 && (
                                    <div className="chart-container">
                                        <ProjectChart
                                            sensorNames={config.selectedSensors}
                                            dataType={config.dataType}
                                            liveMode={config.liveMode}
                                            startTime={config.startTime}
                                            endTime={config.endTime}
                                            sensorType={config.sensorType}
                                            isFullScreen={config.isFullScreen}
                                            onDataUpdate={(data) => {
                                                setChartDataMap(prev => ({ ...prev, [index]: data }));
                                            }}
                                            chartName={config.chartName} // Add this line to pass the chart name
                                            isEditMode={config.isEditMode} // Make sure edit mode is also passed
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;
