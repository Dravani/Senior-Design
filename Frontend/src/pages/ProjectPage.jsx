import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ProjectChart from "../components/ProjectChart";

// CSS Stylings
import "./ProjectPage.css";

const defaultSettings = {
    sensorType: "DHT",
    selectedSensor: "",
    sensors: [],
    startTime: "",
    endTime: "",
    liveMode: false,
    dataType: "humidity",
    showOptions: true,
};

const ProjectPage = () => {
    const { project_name } = useParams();
    const location = useLocation();
    const description = location.state?.description || "No description provided.";
    const [chartConfigs, setChartconfigs] = useState([structuredClone(defaultSettings)]);
    const [fetchedIndices, setFetchedIndices] = useState(new Set());

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
            fetchSensors(value, index);
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
                    <button>Download</button>
                </div>

                <div className="charts-grid">
                    {chartConfigs.map((config, index) => (
                        <div className="chart-settings-box" key={index}>
                            <button
                                className="remove-graph-button"
                                onClick={() => removeChart(index)}
                            >
                                ✕
                            </button>

                            <button
                                className="toggle-options-button"
                                onClick={() => toggleChartOptions(index)}
                            >
                                +
                            </button>

                            {config.showOptions && (
                                <div className="floating-options">
                                    <label>Sensor Type:</label>
                                    <select
                                        value={config.sensorType}
                                        onChange={(e) => updateChartConfig(index, "sensorType", e.target.value)}
                                    >
                                        <option value="DHT">DHT</option>
                                        <option value="Network">Network</option>
                                    </select>

                                    <label>Choose a sensor:</label>
                                    <select
                                        value={config.selectedSensor}
                                        onChange={(e) => updateChartConfig(index, "selectedSensor", e.target.value)}
                                    >
                                        <option value="">-- Choose a Sensor --</option>
                                        {config.sensors.map((sensor, i) => (
                                            <option key={i} value={sensor}>{sensor}</option>
                                        ))}
                                    </select>

                                    <div className="time-range">
                                        <label>Start Time:</label>
                                        <input
                                            type="datetime-local"
                                            value={config.startTime}
                                            onChange={(e) => updateChartConfig(index, "startTime", e.target.value)}
                                        />
                                        <label>End Time:</label>
                                        <input
                                            type="datetime-local"
                                            value={config.endTime}
                                            disabled={config.liveMode}
                                            onChange={(e) => updateChartConfig(index, "endTime", e.target.value)}
                                        />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={config.liveMode}
                                                onChange={(e) => updateChartConfig(index, "liveMode", e.target.checked)}
                                            />
                                            Live Mode
                                        </label>
                                    </div>

                                    {config.sensorType === "DHT" && (
                                        <div className="data-selection">
                                            <label>Data Type:</label>
                                            <select
                                                value={config.dataType}
                                                onChange={(e) => updateChartConfig(index, "dataType", e.target.value)}
                                            >
                                                <option value="humidity">Humidity</option>
                                                <option value="temperature">Temperature</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {config.selectedSensor && config.startTime && (config.liveMode || config.endTime) && (
                                <div className="chart-container">
                                    <ProjectChart
                                        sensorName={config.selectedSensor}
                                        dataType={config.dataType}
                                        liveMode={config.liveMode}
                                        startTime={config.startTime}
                                        endTime={config.endTime}
                                        sensorType={config.sensorType}
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
