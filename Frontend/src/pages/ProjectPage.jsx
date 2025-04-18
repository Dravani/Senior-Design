import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
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
    const { project_name } = useParams();
    const location = useLocation();
    const description = location.state?.description || "No description provided.";
    const [chartConfigs, setChartconfigs] = useState([structuredClone(defaultSettings)]);
    const [fetchedIndices, setFetchedIndices] = useState(new Set());
    const [chartDataMap, setChartDataMap] = useState({});

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
        exportChartsToExcel(chartConfigs, chartDataMap, project_name);
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
    
    useEffect(() => {
        fetchSensors(chartConfigs[0].sensorType, 0);
    }, []);

    return (
        <div className="project-page">
            <div className="dash-title">
                <h1>{decodeURIComponent(project_name)}</h1>
                <h2>{description}</h2>

                <div className="chart-controls">
                    <button onClick={addChart}>Add Chart</button>
                    <button onClick={handleDownloadAllCharts}>Download</button>
                </div>

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
                            >
                                {config.isFullScreen ? "Exit" : "Full"}
                            </button>

                            <button
                                className="toggle-options-button"
                                onClick={() => toggleChartOptions(index)}
                            >
                                ●●●
                            </button>

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
                            {config.selectedSensors.length > 0 && config.startTime && (config.liveMode || config.endTime) && (
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
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;
